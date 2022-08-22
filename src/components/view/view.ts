import Controller from '../controller/controller';
import Dictionary from './dictionary/dictionary';
import Navigation from './navigation/navigation';
import Authorization from './authorization/authorization';
import AudioChallengeView from './audioChallenge/audioChallengeView';

class View {
  public dictionary: Dictionary;
  public audioChallenge: AudioChallengeView;
  private navigation: Navigation;
  public authorization: Authorization;

  constructor(private readonly controller: Controller) {
    this.authorization = new Authorization(this.controller);
    this.dictionary = new Dictionary(this.controller);
    this.audioChallenge = new AudioChallengeView(this.controller, this);
    this.navigation = new Navigation(this);
  }

  public initRender() {
    // this.dictionary.draw();
    // this.controller.audioChallengeController.initAudioChallengeGame();
    // this.authorization.draw();
  }
}

export default View;
