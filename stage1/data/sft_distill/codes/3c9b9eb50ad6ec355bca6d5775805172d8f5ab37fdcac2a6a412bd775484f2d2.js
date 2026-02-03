// 完整的 Phaser3 场景淡入淡出效果示例
class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeState = 'none'; // 可能值: 'none', 'fading-in', 'fading-out', 'complete'
    this.fadeStartTime = 0;
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d3436, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0x00b894, 1);
    centerCircle.fillCircle(400, 300, 80);

    // 创建装饰矩形
    const rect1 = this.add.graphics();
    rect1.fillStyle(0xfdcb6e, 1);
    rect1.fillRect(150, 150, 100, 100);

    const rect2 = this.add.graphics();
    rect2.fillStyle(0xe17055, 1);
    rect2.fillRect(550, 150, 100, 100);

    const rect3 = this.add.graphics();
    rect3.fillStyle(0x6c5ce7, 1);
    rect3.fillRect(150, 350, 100, 100);

    const rect4 = this.add.graphics();
    rect4.fillStyle(0xfd79a8, 1);
    rect4.fillRect(550, 350, 100, 100);

    // 添加文本提示
    const text = this.add.text(400, 300, 'Fade Effect Demo', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    text.setOrigin(0.5);

    const statusText = this.add.text(400, 500, '', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 记录开始时间
    this.fadeStartTime = this.time.now;

    // 更新状态
    this.fadeState = 'fading-in';
    statusText.setText('Status: Fading In...');

    // 开始淡入效果（2000ms = 2秒）
    camera.fadeIn(2000, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.fadeState = 'fading-out';
      statusText.setText('Status: Fading Out...');
      
      console.log('Fade in complete at:', this.time.now - this.fadeStartTime, 'ms');

      // 淡入完成后开始淡出（2000ms = 2秒）
      camera.fadeOut(2000, 0, 0, 0);
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.fadeState = 'complete';
      
      const totalTime = this.time.now - this.fadeStartTime;
      console.log('Fade out complete at:', totalTime, 'ms');
      console.log('Total fade duration:', totalTime, 'ms (expected ~4000ms)');
      
      statusText.setText('Status: Complete!');

      // 可选：淡出完成后重新淡入，形成循环
      // this.time.delayedCall(1000, () => {
      //   this.scene.restart();
      // });
    });

    // 添加调试信息更新
    this.events.on('update', () => {
      if (this.fadeState !== 'complete') {
        const elapsed = this.time.now - this.fadeStartTime;
        console.log(`Fade state: ${this.fadeState}, Elapsed: ${elapsed}ms`);
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// Phaser 游戏配置
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

// 导出状态验证函数（用于测试）
if (typeof window !== 'undefined') {
  window.getFadeState = () => {
    const scene = game.scene.scenes[0];
    return {
      fadeState: scene.fadeState,
      fadeInComplete: scene.fadeInComplete,
      fadeOutComplete: scene.fadeOutComplete,
      elapsedTime: scene.time.now - scene.fadeStartTime
    };
  };
}