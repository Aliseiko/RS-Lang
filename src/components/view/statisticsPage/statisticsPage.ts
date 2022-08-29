import { GameStatistic } from './../../types/types';
import Controller from '../../controller/controller';
import View from '../view';
import './statisticsPage.scss';
import Chart from 'chart.js/auto';
import { Optional, StatisticsData } from '../../types/types';

class StatisticsPage {
  controller: Controller;
  view: View;
  constructor(controller: Controller, view: View) {
    this.controller = controller;
    this.view = view;
  }
  async draw(): Promise<void> {
    this.controller.showLoadingPopup();
    this.view.changeAppTitle('Statistics');
    const state = this.controller.getState();
    const isAuthorized = this.controller.isAuthorized();
    let statistics: string | StatisticsData | undefined = undefined;
    let audioChallengeStatistics: GameStatistic | undefined = undefined;
    let sprintStatistics: GameStatistic | undefined = undefined;
    if (isAuthorized) {
      statistics = (await this.controller.api.getStatistics(state.userId as string, state.token as string))
        .data as StatisticsData;
      audioChallengeStatistics = ((statistics as StatisticsData).optional as Optional)
        ?.audioChallengeStatistics as GameStatistic;
      sprintStatistics = ((statistics as StatisticsData).optional as Optional)?.sprintStatistics as GameStatistic;
    }
    const audioChallengeAccuracy =
      (+(
        (audioChallengeStatistics as GameStatistic)?.rightWords /
        ((audioChallengeStatistics as GameStatistic)?.rightWords +
          (audioChallengeStatistics as GameStatistic)?.wrongWords)
      ).toFixed(2) as number) * 100 || 0;
    const sprintAccuracy =
      (+(
        (sprintStatistics as GameStatistic)?.rightWords /
        ((sprintStatistics as GameStatistic)?.rightWords + (sprintStatistics as GameStatistic)?.wrongWords)
      ).toFixed(2) as number) * 100 || 0;
    (document.querySelector('.main-window') as HTMLElement).innerHTML = `
      ${
        !isAuthorized
          ? `<div class='darkened-background'>
              <h2>Прежде, чем посмотреть статистику, авторизуйтесь</h2>
            </div>`
          : ''
      }
      <div class='statistics-page'>
        <div class='today-statistics'>
          <h3 class='statistics-title'>Сегодня</h3>
          <div class='today-indicators'>
            <div class='learned-words'>
              <h3 class='learned-words-title'>Изученных слов:</h3>
              <h3 class='learned-words-counter'>${
                statistics?.optional.globalStatistics[new Date().toDateString()]?.learnedWords || 0
              }</h3>
            </div>
            <div class='new-words'>
              <h3 class='new-words-title'>Новых слов:</h3>
              <h3 class='new-words-counter'>${
                statistics?.optional.globalStatistics[new Date().toDateString()]?.newWords || 0
              }</h3>
            </div>
            <div class='accuracy'>
              <h3 class='accuracy-title'>Точность</h3>
              <h3 class='accuracy-counter'>${
                (audioChallengeAccuracy * sprintAccuracy) / 2 || audioChallengeAccuracy || sprintAccuracy
              }%</h3>
            </div>
            <div class='sprint-indicator'>
              <h3 class='sprint-indicator-title'>Спринт</h3>
              <div class='indicator-stats'>
                <div class='sprint-words'>
                  <span>Слов</span>
                  <span>${
                    (sprintStatistics as GameStatistic)?.rightWords + (sprintStatistics as GameStatistic)?.wrongWords ||
                    0
                  }</span>
                </div>
                <div class='sprint-accuracy'>
                  <span>Точность</span>
                  <span>${sprintAccuracy}%</span>
                </div>
                <div class='sprint-in-row'>
                  <span>Угадано подряд</span>
                  <span>${(sprintStatistics as GameStatistic)?.maxInRow || 0}</span>
                </div>
              </div>
            </div>
            <div class='audio-challenge-indicator'>
              <h3 class='audio-challenge-indicator-title'>Аудиовызов</h3>
              <div class='indicator-stats'>
                <div class='audio-challenge-words'>
                  <span>Слов</span>
                  <span>${
                    (audioChallengeStatistics as GameStatistic)?.rightWords +
                      (audioChallengeStatistics as GameStatistic)?.wrongWords || 0
                  }</span>
                </div>
                <div class='audio-challenge-accuracy'>
                  <span>Точность</span>
                  <span>${audioChallengeAccuracy}%</span>
                </div>
                <div class='audio-challenge-in-row'>
                  <span>Угадано подряд</span>
                  <span>${(audioChallengeStatistics as GameStatistic)?.maxInRow || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        ${
          isAuthorized
            ? `
          <div class='alltime-statistics'>
            <h3 class='statistics-title'>Все время</h3>
            <div class='alltime-statistics-charts'>
              <div class='alltime-words'>
                <canvas id='chart-words' width='400' height='300'></canvas>
              </div>
              <div class='alltime-progress'>
                <canvas id='chart-progress' width='400' height='300'></canvas>
              </div>
            </div>
          </div>
          `
            : ''
        }
      </div>
    `;
    if (isAuthorized) {
      // const words = await this.controller.api.getAllUserAggregatedWords(
      //   state.userId as string,
      //   state.token as string,
      //   `{"$nor":[{ "userWord": null}]}`,
      //   undefined,
      //   undefined,
      //   settings.COUNT_OF_WORDS()
      // );
      // console.log(words);
      console.log(statistics);
      const minDate = new Date(statistics?.optional.registrationDate as string).getTime();
      const maxDate = Math.max(
        ...Object.keys((statistics as StatisticsData).optional.globalStatistics).map((date) => new Date(date).getTime())
      );
      const dataLabels = [];
      const newWordsDataset = [];
      const learnedWordsDataset = [];
      for (let i = minDate; i <= maxDate; i = i + 24 * 60 * 60 * 1000) {
        dataLabels.push(new Date(i).toLocaleDateString());
        newWordsDataset.push(
          (statistics as StatisticsData).optional.globalStatistics[new Date(i).toDateString()]?.newWords || 0
        );
        learnedWordsDataset.push(
          (statistics as StatisticsData).optional.globalStatistics[new Date(i).toDateString()]?.learnedWords || 0
        );
      }
      const wordsChart = document.getElementById('chart-words') as HTMLCanvasElement;
      const progressChart = document.getElementById('chart-progress') as HTMLCanvasElement;
      new Chart(wordsChart, {
        type: 'line',
        data: {
          labels: dataLabels,
          datasets: [
            {
              label: 'Слова',
              data: newWordsDataset,
              backgroundColor: 'orange',
              borderColor: 'lightcoral',
              borderWidth: 2,
            },
          ],
        },
        options: {
          elements: {
            line: {
              tension: 0.3,
            },
          },
          scales: {
            yAxes: {
              min: 0,
              suggestedMax: 10,
            },
            xAxes: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 20,
                },
              },
              onClick: () => {},
            },
          },
        },
      });
      new Chart(progressChart, {
        type: 'line',
        data: {
          labels: dataLabels,
          datasets: [
            {
              label: 'Прогресс',
              data: learnedWordsDataset,
              backgroundColor: 'green',
              borderColor: 'lightgreen',
              borderWidth: 2,
            },
          ],
        },
        options: {
          elements: {
            line: {
              tension: 0.3,
            },
          },
          scales: {
            yAxes: {
              min: 0,
              suggestedMax: 10,
            },
            xAxes: {
              grid: {
                display: false,
              },
            },
          },
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 20,
                },
              },
              onClick: () => {},
            },
          },
        },
      });
    }
    this.controller.hideLoadingPopup();
  }
}

export default StatisticsPage;
