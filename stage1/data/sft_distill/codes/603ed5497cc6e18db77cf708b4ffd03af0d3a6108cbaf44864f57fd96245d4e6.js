class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录相机弹跳触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 绘制背景网格，方便观察相机弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制网格线
    graphics.lineStyle(1, 0x333333, 1);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心圆形作为参考点
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(400, 300, 30);

    // 绘制四个角的矩形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(20, 20, 60, 60);
    graphics.fillRect(720, 20, 60, 60);
    graphics.fillRect(20, 520, 60, 60);
    graphics.fillRect(720, 520, 60, 60);

    // 添加文本提示
    const instructionText = this.add.text(400, 50, '点击鼠标左键触发相机弹跳', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示弹跳计数
    this.countText = this.add.text(400, 550, '弹跳次数: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 确保是鼠标左键
      if (pointer.leftButtonDown()) {
        this.triggerCameraShake();
      }
    });

    // 获取主相机引用
    this.mainCamera = this.cameras.main;
  }

  triggerCameraShake() {
    // 触发相机弹跳效果
    // 参数：持续时间(ms), 强度, 是否强制重启, 回调函数, 回调上下文
    this.mainCamera.shake(1000, 0.01);

    // 更新状态计数
    this.shakeCount++;
    this.countText.setText(`弹跳次数: ${this.shakeCount}`);

    // 在控制台输出状态信息
    console.log(`相机弹跳触发 #${this.shakeCount}`);
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
const game = new Phaser.Game(config);