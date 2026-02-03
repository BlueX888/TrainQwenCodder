class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.totalFadeDuration = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d3561, 1);
    graphics.fillRect(0, 0, width, height);

    // 添加装饰元素
    graphics.fillStyle(0x4a5899, 1);
    graphics.fillCircle(width * 0.25, height * 0.3, 80);
    graphics.fillCircle(width * 0.75, height * 0.7, 100);
    
    graphics.fillStyle(0x6b7bb5, 1);
    graphics.fillRect(width * 0.4, height * 0.5, 160, 120);

    // 添加标题文字
    const titleText = this.add.text(width / 2, height / 2 - 50, 'FADE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(width / 2, height / 2 + 50, 'Fading In...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffcc00'
    });
    this.statusText.setOrigin(0.5);

    // 添加计时器文字
    this.timerText = this.add.text(width / 2, height / 2 + 100, 'Time: 0.0s', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#00ff00'
    });
    this.timerText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 开始淡入效果（2000ms = 2秒）
    camera.fadeIn(2000, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.statusText.setText('Fade In Complete! Fading Out...');
      console.log('Fade in completed');

      // 淡入完成后开始淡出效果（2000ms = 2秒）
      camera.fadeOut(2000, 0, 0, 0);
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.statusText.setText('Fade Out Complete!');
      console.log('Fade out completed');
      console.log('Total fade duration:', this.totalFadeDuration.toFixed(2), 'seconds');
    });

    // 记录开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    // 更新总时长
    this.totalFadeDuration = (time - this.startTime) / 1000;
    
    // 更新计时器显示
    if (this.timerText) {
      this.timerText.setText(`Time: ${this.totalFadeDuration.toFixed(1)}s`);
    }

    // 在控制台输出状态（用于验证）
    if (this.fadeInComplete && !this.fadeOutComplete && !this.loggedFadeIn) {
      console.log('Status: Fade in complete, fade out in progress');
      this.loggedFadeIn = true;
    }

    if (this.fadeOutComplete && !this.loggedFadeOut) {
      console.log('Status: All fade effects complete');
      console.log('fadeInComplete:', this.fadeInComplete);
      console.log('fadeOutComplete:', this.fadeOutComplete);
      this.loggedFadeOut = true;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FadeScene
};

// 创建游戏实例
const game = new Phaser.Game(config);