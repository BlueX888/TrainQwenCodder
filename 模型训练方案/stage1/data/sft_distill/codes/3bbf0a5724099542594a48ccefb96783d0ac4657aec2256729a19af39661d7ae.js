class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些参考物体，用于观察闪烁效果
    const circle1 = this.add.graphics();
    circle1.fillStyle(0xe74c3c, 1);
    circle1.fillCircle(200, 300, 50);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0x3498db, 1);
    circle2.fillCircle(400, 300, 50);

    const circle3 = this.add.graphics();
    circle3.fillStyle(0x2ecc71, 1);
    circle3.fillCircle(600, 300, 50);

    // 创建提示文本
    this.instructionText = this.add.text(400, 100, 'Click Left Mouse Button to Flash!', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.instructionText.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 500, `Flash Count: ${this.flashCount}`, {
      fontSize: '20px',
      color: '#f39c12',
      fontFamily: 'Arial'
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为左键（button === 0）
      if (pointer.leftButtonDown()) {
        this.triggerFlash();
      }
    });

    // 添加闪烁效果完成的监听（可选，用于调试）
    this.mainCamera.on('cameraflashcomplete', () => {
      console.log('Flash effect completed');
    });
  }

  triggerFlash() {
    // 触发相机闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制重启, 回调函数, 上下文
    this.mainCamera.flash(
      4000,        // 持续 4 秒
      255,         // 红色通道强度
      255,         // 绿色通道强度
      255,         // 蓝色通道强度
      false,       // 不强制重启（如果已有闪烁在进行中）
      (camera, progress) => {
        // 闪烁进行中的回调（可选）
        if (progress === 1) {
          console.log('Flash animation finished');
        }
      }
    );

    // 更新状态
    this.flashCount++;
    this.statusText.setText(`Flash Count: ${this.flashCount}`);

    console.log(`Flash triggered! Total count: ${this.flashCount}`);
  }

  update(time, delta) {
    // 本示例无需 update 逻辑
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