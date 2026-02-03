class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.fadeState = 'none'; // 'none', 'fading-in', 'visible', 'fading-out', 'complete'
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x2d5a8c, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // 程序化生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(25, 25, 25);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setScale(1.5);

    // 添加标题文本
    this.titleText = this.add.text(width / 2, 100, 'Scene Fade Demo', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.titleText.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(width / 2, height - 80, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00'
    });
    this.statusText.setOrigin(0.5);

    // 添加装饰元素
    for (let i = 0; i < 5; i++) {
      const starGraphics = this.add.graphics();
      starGraphics.fillStyle(0xffff00, 0.8);
      starGraphics.fillStar(15, 15, 5, 10, 15);
      starGraphics.generateTexture(`star${i}`, 30, 30);
      starGraphics.destroy();

      const star = this.add.sprite(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(150, height - 150),
        `star${i}`
      );
      
      // 添加旋转动画
      this.tweens.add({
        targets: star,
        angle: 360,
        duration: 3000 + i * 500,
        repeat: -1,
        ease: 'Linear'
      });
    }

    // 开始淡入效果
    this.startFadeSequence();
  }

  startFadeSequence() {
    const camera = this.cameras.main;
    
    // 设置初始状态
    this.fadeState = 'fading-in';
    this.updateStatusText();

    // 淡入效果（从黑色淡入，持续1500ms）
    camera.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeState = 'visible';
      this.updateStatusText();
      
      console.log('Fade in complete!');

      // 等待2秒后开始淡出
      this.time.delayedCall(2000, () => {
        this.startFadeOut();
      });
    });
  }

  startFadeOut() {
    const camera = this.cameras.main;
    
    this.fadeState = 'fading-out';
    this.updateStatusText();

    // 淡出效果（淡出到黑色，持续1500ms）
    camera.fadeOut(1500, 0, 0, 0);

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeState = 'complete';
      this.updateStatusText();
      
      console.log('Fade out complete!');

      // 淡出完成后可以重启场景或切换到其他场景
      this.time.delayedCall(1000, () => {
        console.log('Restarting scene...');
        this.scene.restart();
      });
    });
  }

  updateStatusText() {
    const stateMessages = {
      'none': 'Initializing...',
      'fading-in': 'Fading In... (1.5s)',
      'visible': 'Scene Visible - Waiting...',
      'fading-out': 'Fading Out... (1.5s)',
      'complete': 'Fade Complete - Restarting...'
    };

    this.statusText.setText(stateMessages[this.fadeState]);
    
    // 添加状态指示器
    const statusInfo = [
      `Fade In Complete: ${this.fadeInComplete}`,
      `Fade Out Complete: ${this.fadeOutComplete}`,
      `Current State: ${this.fadeState}`
    ].join(' | ');
    
    console.log(statusInfo);
  }

  update(time, delta) {
    // 让玩家精灵轻微浮动
    if (this.player) {
      this.player.y = this.cameras.main.height / 2 + Math.sin(time / 500) * 20;
    }
  }
}

// 游戏配置
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