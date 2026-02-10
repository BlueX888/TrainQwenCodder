class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isRotating = true; // 状态信号：是否正在旋转
    this.rotationComplete = false; // 状态信号：旋转是否完成
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建一些可视化元素来观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制背景网格
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
    
    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);
    
    // 绘制四个角的标记
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(50, 50, 40, 40);
    graphics.fillRect(710, 50, 40, 40);
    graphics.fillRect(50, 510, 40, 40);
    graphics.fillRect(710, 510, 40, 40);
    
    // 添加文字提示
    const text = this.add.text(400, 300, 'Rotating Scene', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);
    
    // 获取主相机
    const camera = this.cameras.main;
    
    // 设置相机旋转中心点（默认是左上角，我们改为屏幕中心）
    camera.setOrigin(0.5, 0.5);
    camera.setPosition(400, 300);
    
    // 创建旋转动画
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
      duration: 1000, // 持续 1 秒
      ease: 'Cubic.easeInOut', // 缓动函数
      onStart: () => {
        console.log('Scene rotation started');
        this.isRotating = true;
      },
      onComplete: () => {
        console.log('Scene rotation completed');
        this.isRotating = false;
        this.rotationComplete = true;
        
        // 重置相机旋转角度为 0，避免累积
        camera.rotation = 0;
        
        // 显示完成提示
        text.setText('Rotation Complete!');
      }
    });
    
    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上不随相机旋转
  }

  update(time, delta) {
    // 更新状态显示
    const camera = this.cameras.main;
    const rotationDegrees = Phaser.Math.RadToDeg(camera.rotation).toFixed(1);
    
    this.statusText.setText([
      `Rotating: ${this.isRotating}`,
      `Complete: ${this.rotationComplete}`,
      `Rotation: ${rotationDegrees}°`,
      `Time: ${(time / 1000).toFixed(2)}s`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);