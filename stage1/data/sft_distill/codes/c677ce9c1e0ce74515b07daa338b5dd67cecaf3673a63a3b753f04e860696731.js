class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：用于验证旋转是否完成
    this.rotationComplete = false;
    this.rotationProgress = 0; // 0-100 表示旋转进度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格以便观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x < width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(width / 2, height / 2, 20);

    // 绘制一些参考对象
    const rect1 = this.add.graphics();
    rect1.fillStyle(0x0000ff, 1);
    rect1.fillRect(100, 100, 100, 100);

    const rect2 = this.add.graphics();
    rect2.fillStyle(0xffff00, 1);
    rect2.fillRect(600, 100, 100, 100);

    const rect3 = this.add.graphics();
    rect3.fillStyle(0xff00ff, 1);
    rect3.fillRect(100, 400, 100, 100);

    const rect4 = this.add.graphics();
    rect4.fillStyle(0x00ffff, 1);
    rect4.fillRect(600, 400, 100, 100);

    // 添加文本提示
    const text = this.add.text(width / 2, 50, 'Scene Rotating...', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 设置相机旋转中心为屏幕中心
    camera.setRotation(0);

    // 创建旋转动画：从0度旋转到360度（2π弧度），持续2秒
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 360度 = 2π弧度
      duration: 2000, // 2秒
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        // 更新旋转进度
        this.rotationProgress = Math.floor(tween.progress * 100);
      },
      onComplete: () => {
        // 旋转完成后重置为0，避免累积误差
        camera.setRotation(0);
        this.rotationComplete = true;
        this.rotationProgress = 100;
        
        // 更新文本提示
        text.setText('Rotation Complete!');
        text.setStyle({ color: '#00ff00' });
        
        console.log('Scene rotation completed');
        console.log('Rotation status:', {
          complete: this.rotationComplete,
          progress: this.rotationProgress
        });
      }
    });

    // 添加调试信息显示
    const debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 更新调试信息
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        debugText.setText([
          `Rotation Progress: ${this.rotationProgress}%`,
          `Rotation Complete: ${this.rotationComplete}`,
          `Camera Rotation: ${(camera.rotation * 180 / Math.PI).toFixed(1)}°`
        ]);
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
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);