class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格，便于观察相机弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心圆形作为参照物
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(400, 300, 50);

    // 绘制四个角的矩形
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(50, 50, 60, 60);
    graphics.fillRect(690, 50, 60, 60);
    graphics.fillRect(50, 490, 60, 60);
    graphics.fillRect(690, 490, 60, 60);

    // 添加提示文本
    const instructionText = this.add.text(400, 150, '点击鼠标左键触发相机弹跳', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示触发次数的文本
    this.countText = this.add.text(400, 450, `弹跳次数: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 确保是左键点击
      if (pointer.leftButtonDown()) {
        // 触发相机弹跳效果
        // 参数：强度(0.05表示弹跳幅度)，持续时间(1000ms = 1秒)
        this.mainCamera.shake(1000, 0.01);
        
        // 更新状态计数
        this.shakeCount++;
        this.countText.setText(`弹跳次数: ${this.shakeCount}`);
        
        // 控制台输出，便于验证
        console.log(`相机弹跳触发 #${this.shakeCount}`);
      }
    });

    // 监听相机弹跳完成事件（可选，用于验证）
    this.mainCamera.on('camerashakecomplete', () => {
      console.log('相机弹跳效果完成');
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);