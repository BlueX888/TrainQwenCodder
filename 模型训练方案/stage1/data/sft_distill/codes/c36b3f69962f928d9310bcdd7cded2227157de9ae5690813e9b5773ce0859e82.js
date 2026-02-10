class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.fadeState = 'none'; // 可能值: 'none', 'fading-in', 'fading-out', 'complete'
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d5a8f, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建中心文字背景
    const textBg = this.add.graphics();
    textBg.fillStyle(0x1a3a5a, 0.8);
    textBg.fillRoundedRect(200, 250, 400, 100, 10);

    // 添加标题文字
    const titleText = this.add.text(400, 300, 'Fade Effect Demo', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 400, 'Status: Starting...', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 添加装饰元素
    for (let i = 0; i < 5; i++) {
      const circle = this.add.graphics();
      circle.fillStyle(0x4a90e2, 0.6);
      circle.fillCircle(
        100 + i * 150,
        100,
        30
      );
    }

    // 开始淡入效果
    this.startFadeSequence();
  }

  startFadeSequence() {
    // 设置初始状态
    this.fadeState = 'fading-in';
    this.statusText.setText('Status: Fading In...');

    // 淡入效果 - 从黑色淡入，持续1500毫秒
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    this.cameras.main.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeState = 'fade-in-complete';
      this.statusText.setText('Status: Fade In Complete!');
      
      console.log('Fade in completed');

      // 等待一小段时间后开始淡出
      this.time.delayedCall(500, () => {
        this.startFadeOut();
      });
    });
  }

  startFadeOut() {
    this.fadeState = 'fading-out';
    this.statusText.setText('Status: Fading Out...');

    // 淡出效果 - 淡出到黑色，持续1500毫秒
    this.cameras.main.fadeOut(1500, 0, 0, 0);

    // 监听淡出完成事件
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeState = 'complete';
      
      console.log('Fade out completed');
      console.log('Total fade sequence completed (3 seconds)');

      // 淡出完成后可以重新开始或切换场景
      this.time.delayedCall(1000, () => {
        // 重新淡入，形成循环效果
        this.fadeInComplete = false;
        this.fadeOutComplete = false;
        this.startFadeSequence();
      });
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前状态可通过 this.fadeState 访问
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 验证接口 - 可以通过这些方法检查状态
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    fadeState: scene.fadeState,
    fadeInComplete: scene.fadeInComplete,
    fadeOutComplete: scene.fadeOutComplete
  };
};