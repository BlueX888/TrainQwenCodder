class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeState = 'none'; // none, fading-in, visible, fading-out, complete
    this.fadeStartTime = 0;
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, width, height);

    // 创建中心文本
    this.statusText = this.add.text(width / 2, height / 2, '场景淡入中...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 创建状态信息文本
    this.infoText = this.add.text(width / 2, height / 2 + 60, '', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加装饰性元素
    const circle1 = this.add.graphics();
    circle1.fillStyle(0x4a90e2, 0.6);
    circle1.fillCircle(width / 4, height / 4, 50);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0xe24a4a, 0.6);
    circle2.fillCircle(width * 3 / 4, height * 3 / 4, 60);

    const rect = this.add.graphics();
    rect.fillStyle(0x4ae290, 0.6);
    rect.fillRect(width - 150, 50, 100, 100);

    // 获取主相机
    const camera = this.cameras.main;

    // 记录开始时间
    this.fadeStartTime = this.time.now;
    this.fadeState = 'fading-in';

    // 场景淡入（2秒，从黑色淡入）
    camera.fadeIn(2000, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeState = 'visible';
      this.statusText.setText('场景可见中...');
      
      console.log('淡入完成');

      // 淡入完成后等待，然后开始淡出（总共4秒，淡入2秒+淡出2秒）
      this.time.delayedCall(0, () => {
        this.fadeState = 'fading-out';
        this.statusText.setText('场景淡出中...');
        
        // 场景淡出（2秒，淡出到黑色）
        camera.fadeOut(2000, 0, 0, 0);
      });
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeState = 'complete';
      this.statusText.setText('淡入淡出完成');
      
      console.log('淡出完成');
      console.log('总耗时:', this.time.now - this.fadeStartTime, 'ms');
    });
  }

  update(time, delta) {
    // 更新状态信息显示
    const elapsed = (time - this.fadeStartTime) / 1000;
    
    this.infoText.setText([
      `状态: ${this.fadeState}`,
      `已用时间: ${elapsed.toFixed(2)}s`,
      `淡入完成: ${this.fadeInComplete}`,
      `淡出完成: ${this.fadeOutComplete}`
    ]);

    // 根据状态改变文本颜色
    switch(this.fadeState) {
      case 'fading-in':
        this.infoText.setColor('#ffff00');
        break;
      case 'visible':
        this.infoText.setColor('#00ff00');
        break;
      case 'fading-out':
        this.infoText.setColor('#ff9900');
        break;
      case 'complete':
        this.infoText.setColor('#ff0000');
        break;
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FadeScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);