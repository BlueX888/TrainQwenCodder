class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.fadeState = 'none'; // none, fading-in, fade-in-complete, fading-out, fade-out-complete
    this.fadeInStartTime = 0;
    this.fadeOutStartTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建标题文本
    const title = this.add.text(400, 150, 'Fade Effect Demo', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 250, 'Status: Preparing...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#3498db'
    });
    this.statusText.setOrigin(0.5);

    // 创建装饰性图形元素
    const graphics = this.add.graphics();
    
    // 绘制圆形
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(200, 400, 50);
    
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(400, 450, 60);
    
    graphics.fillStyle(0x2ecc71, 1);
    graphics.fillCircle(600, 400, 50);

    // 绘制矩形
    graphics.fillStyle(0xf39c12, 0.8);
    graphics.fillRect(100, 500, 150, 80);
    
    graphics.fillStyle(0x9b59b6, 0.8);
    graphics.fillRect(550, 500, 150, 80);

    // 获取主相机
    const camera = this.cameras.main;

    // 开始淡入效果（2500毫秒 = 2.5秒）
    this.fadeState = 'fading-in';
    this.fadeInStartTime = this.time.now;
    this.statusText.setText('Status: Fading In...');

    camera.fadeIn(2500, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeState = 'fade-in-complete';
      this.statusText.setText('Status: Fade In Complete!');
      
      console.log('Fade in completed at:', this.time.now - this.fadeInStartTime, 'ms');

      // 等待1秒后开始淡出
      this.time.delayedCall(1000, () => {
        this.fadeState = 'fading-out';
        this.fadeOutStartTime = this.time.now;
        this.statusText.setText('Status: Fading Out...');
        
        // 开始淡出效果（2500毫秒 = 2.5秒）
        camera.fadeOut(2500, 0, 0, 0);
      });
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeState = 'fade-out-complete';
      console.log('Fade out completed at:', this.time.now - this.fadeOutStartTime, 'ms');
      
      // 淡出完成后重新启动场景（演示循环效果）
      this.time.delayedCall(500, () => {
        this.scene.restart();
      });
    });

    // 添加说明文本
    const instruction = this.add.text(400, 550, 
      'Scene will fade in (2.5s) → wait (1s) → fade out (2.5s) → restart', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    instruction.setOrigin(0.5);
  }

  update(time, delta) {
    // 实时更新状态显示
    if (this.fadeState === 'fading-in') {
      const elapsed = ((time - this.fadeInStartTime) / 1000).toFixed(2);
      this.statusText.setText(`Status: Fading In... (${elapsed}s / 2.5s)`);
    } else if (this.fadeState === 'fading-out') {
      const elapsed = ((time - this.fadeOutStartTime) / 1000).toFixed(2);
      this.statusText.setText(`Status: Fading Out... (${elapsed}s / 2.5s)`);
    }
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