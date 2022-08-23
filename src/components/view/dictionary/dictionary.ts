import { UserWord } from './../../types/types';
import settings from '../../settings';
import { Word } from '../../types/types';
import './dictionary.scss';
import DictionaryController from '../../controller/dictionaryController';
import Controller from '../../controller/controller';
import View from '../view';

class Dictionary {
  dictionaryController: DictionaryController;
  baseController: Controller;
  view: View;

  constructor(controller: Controller, view: View) {
    this.baseController = controller;
    this.view = view;
    this.dictionaryController = controller.dictionary;
    this.dictionaryController.onDictionaryUpdate.push(
      this.draw.bind(this),
      this.baseController.playStopAudio.bind(controller, '', false)
    );
  }

  draw(): void {
    this.view.changeAppTitle('Dictionary');
    const groupBtns = new Array(settings.MAX_DIFFICULTY_LEVEL + 2)
      .fill('')
      .map((item, index) => `<button class='round-button group-${index + 1}'>${index + 1}</button>`)
      .join('');
    let pagination: string;
    if (this.dictionaryController.getDictionaryGroup() === 6) {
      pagination = '';
    } else {
      pagination = `
      <div class='dictionary-pagination'>
        <button class='rounded-button prev' disabled>Prev</button>
        <h4 class="dictionary-page-number">1</h4>
        <button class='rounded-button next'>Next</button>
      </div>
    `;
    }
    (document.querySelector('.main-window') as HTMLElement).innerHTML = `
    <div class='dictionary'>
      ${pagination}
      <div class='dictionary-groups'>
        <span>Difficulty</span>
        <div class='group-buttons'>
          ${groupBtns}
        </div>
      </div>
      <div class='dictionary-words'>
      
      </div>
      ${pagination}
    </div>
    `;
    (document.querySelector('.group-buttons') as HTMLElement).childNodes.forEach((elem) => {
      elem.addEventListener('click', () => {
        this.dictionaryController.setDictionaryGroup(+(elem.textContent as string) - 1);
      });
    });
    document
      .querySelectorAll('.dictionary-pagination')
      .forEach((item) => item.addEventListener('click', (e) => this.onPaginationClick(e)));
    this.updatePagination();
    this.updateGroupButtons();
    this.updateWords();
  }

  async updateWords() {
    const words = await this.dictionaryController.getWords();
    const userWords = await this.dictionaryController.getUserWords();
    let items;
    if (typeof words === 'string') {
      items = words;
    } else {
      items = (words as unknown as Word[])
        .map((word) => {
          return `<div class='word-card' data-id=${word.id}>
            <img class='image' src='${settings.DATABASE_URL}/${word.image}'>
            <div class='description'>
              <div class='title'>
                <span class='word'>${word.word.charAt(0).toUpperCase() + word.word.slice(1)}</span>
                <span class='transcription'>${word.transcription}</span>
                <div class='translation'>${word.wordTranslate}</div>
              </div>
              <div class='text-example'>
                <p>${word.textExample}</p>
                <p class='translation'>${word.textExampleTranslate}</p>
              </div>
              <div class='text-meaning'>
                <p>${word.textMeaning}</p>
                <p class='translation'>${word.textMeaningTranslate}</p>
              </div>
              <div class='buttons'>
                <button class='add-difficult-button flat-button'>${
                  this.dictionaryController.getDictionaryGroup() !== 6 ? `Difficult` : 'Remove from Difficult'
                }</button>
              ${
                this.dictionaryController.getDictionaryGroup() !== 6
                  ? `<button class='add-learned-button flat-button'>Learned</button>`
                  : ''
              }
              </div>
            </div>
            <div
              class='audio-image'
              audio='${word.audio}'
              audio-example='${word.audioExample}'
              audio-meaning='${word.audioMeaning}'
            ></div>
          </div>`;
        })
        .join('');
    }
    document.querySelector('.dictionary-words')?.insertAdjacentHTML('beforeend', items as string);
    document.querySelectorAll('.audio-image').forEach((elem) => {
      elem.addEventListener('click', (e: Event) => {
        const currTarget = e.currentTarget as HTMLElement;
        let audioURL = [
          currTarget.getAttribute('audio'),
          currTarget.getAttribute('audio-example'),
          currTarget.getAttribute('audio-meaning'),
        ];
        if (currTarget.classList.contains('playing')) {
          audioURL = [];
        }
        let current = 0;
        this.audioHandler(currTarget, audioURL[current] as string);
        this.baseController.onAudioEnded(() => {
          current++;
          if (!(current >= audioURL.length)) {
            currTarget.classList.remove('playing');
            this.audioHandler(currTarget, audioURL[current] as string);
          } else {
            currTarget.classList.remove('playing');
          }
        });
      });
    });

    document.querySelectorAll('.word-card').forEach((card) => {
      (userWords as UserWord[]).forEach((userWord) => {
        if (card.getAttribute('data-id') === userWord.wordId) {
          card.classList.add(`${userWord.difficulty}`);
        }
      });
      card.addEventListener('click', async (e: Event) => {
        const target = e.target as HTMLElement;
        const currTarget = e.currentTarget as HTMLElement;
        if (target.classList.contains('add-difficult-button')) {
          const id = currTarget.getAttribute('data-id') as string;
          this.dictionaryController.updateUserWord(id, 'difficult');
          currTarget.classList.remove('learned');
          currTarget.classList.add('difficult');
        }
        if (target.classList.contains('add-learned-button')) {
          const id = currTarget.getAttribute('data-id') as string;
          this.dictionaryController.updateUserWord(id, 'learned');
          currTarget.classList.remove('difficult');
          currTarget.classList.add('learned');
        }
      });
    });
  }

  private audioHandler(currTarget: HTMLElement, audioFile: string) {
    if (!currTarget.classList.contains('playing')) {
      this.baseController.playStopAudio(audioFile as string);
      document.querySelectorAll('.audio-image.playing').forEach((img) => img.classList.remove('playing'));
      currTarget.classList.add('playing');
    } else {
      this.baseController.playStopAudio('', false);
      currTarget.classList.remove('playing');
    }
  }

  private updateGroupButtons() {
    (document.querySelector('.group-buttons') as HTMLElement).childNodes.forEach((elem) => {
      (elem as HTMLButtonElement).disabled = false;
      if (+(elem.textContent as string) === this.dictionaryController.getDictionaryGroup() + 1) {
        (elem as HTMLButtonElement).disabled = true;
      }
    });
  }

  private onPaginationClick(e: Event) {
    const target = e.target as HTMLElement;
    const page = this.dictionaryController.getDictionaryPage();
    if (target.classList.contains('prev')) {
      this.dictionaryController.setDictionaryPage(page - 1);
    }
    if (target.classList.contains('next')) {
      this.dictionaryController.setDictionaryPage(page + 1);
    }
  }

  private updatePagination() {
    const prev = document.querySelectorAll('.dictionary-pagination .prev');
    const next = document.querySelectorAll('.dictionary-pagination .next');
    prev.forEach((item) => ((item as HTMLButtonElement).disabled = false));
    next.forEach((item) => ((item as HTMLButtonElement).disabled = false));
    if (this.dictionaryController.getDictionaryPage() <= 0) {
      prev.forEach((item) => ((item as HTMLButtonElement).disabled = true));
    }
    if (this.dictionaryController.getDictionaryPage() === this.dictionaryController.getMaxDictionaryPage()) {
      next.forEach((item) => ((item as HTMLButtonElement).disabled = true));
    }
    document
      .querySelectorAll('.dictionary-page-number')
      .forEach(
        (item) =>
          (item.innerHTML = `${this.dictionaryController.getDictionaryPage() + 1} / ${
            this.dictionaryController.getMaxDictionaryPage() + 1
          }`)
      );
  }
}

export default Dictionary;
