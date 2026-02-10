class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.fadeStatus = 'starting'; // starting, fading-in, fading-out, complete
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x2d2d2d, 1);
    background.fillRect(0, 0, width, height);

    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x00ff00, 1);
    centerCircle.fillCircle(width / 2, height / 2, 80);

    // 创建装饰矩形
    const rect1 = this.add.graphics();
    rect1.fillStyle(0xff6b6b, 1);
    rect1.fillRect(100, 100, 150, 100);

    const rect2 = this.add.graphics();
    rect2.fillStyle(0x4ecdc4, 1);
    rect2.fillRect(550, 100, 150, 100);

    const rect3 = this.add.graphics();
    rect3.fillStyle(0xffe66d, 1);
    rect3.fillRect(100, 400, 150, 100);

    const rect4 = this.add.graphics();
    rect4.fillStyle(0x95e1d3, 1);
    rect4.fillRect(550, 400, 150, 100);

    // 添加状态文本
    this.statusText = this.add.text(width / 2, height / 2 - 120, 'Fade Status: Starting', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 添加提示文本
    this.infoText = this.add.text(width / 2, height - 50, 'Watch the fade in/out effect (3 seconds total)', {
      fontSize: '18px',
      color: '#cccccc'
    });
    this.infoText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 设置初始状态
    this.fadeStatus = 'fading-in';
    this.updateStatusText();

    // 开始淡入效果（1500ms）
    camera.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeStatus = 'fading-out';
      this.updateStatusText();

      console.log('Fade in complete! Starting fade out...');

      // 淡入完成后开始淡出效果（1500ms）
      camera.fadeOut(1500, 0, 0, 0);
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeStatus = 'complete';
      this.updateStatusText();

      console.log('Fade out complete! Total duration: 3 seconds');

      // 可选：淡出完成后再次淡入，形成循环
      setTimeout(() => {
        this.resetFade();
      }, 1000);
    });
  }

  updateStatusText() {
    const statusMap = {
      'starting': 'Starting...',
      'fading-in': 'Fading In (0-1.5s)',
      'fading-out': 'Fading Out (1.5-3s)',
      'complete': 'Complete! (Restarting...)'
    };

    this.statusText.setText(`Fade Status: ${statusMap[this.fadeStatus]}`);
  }

  resetFade() {
    // 重置状态并重新开始淡入淡出循环
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.fadeStatus = 'fading-in';
    this.updateStatusText();

    const camera = this.cameras.main;
    
    camera.fadeIn(1500, 0, 0, 0);

    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeStatus = 'fading-out';
      this.updateStatusText();

      camera.fadeOut(1500, 0, 0, 0);
    });

    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeStatus = 'complete';
      this.updateStatusText();

      setTimeout(() => {
        this.resetFade();
      }, 1000);
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
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
new Phaser.Game(config);