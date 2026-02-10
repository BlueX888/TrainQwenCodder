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
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 绘制一些装饰性的形状，方便观察闪烁效果
    const circle1 = this.add.graphics();
    circle1.fillStyle(0xff6b6b, 1);
    circle1.fillCircle(200, 200, 50);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0x4ecdc4, 1);
    circle2.fillCircle(600, 200, 50);

    const rect = this.add.graphics();
    rect.fillStyle(0xffe66d, 1);
    rect.fillRect(300, 400, 200, 100);

    // 添加提示文本
    const instructionText = this.add.text(400, 50, '右键点击触发相机闪烁效果', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    instructionText.setOrigin(0.5);

    // 显示闪烁次数的文本
    this.flashCountText = this.add.text(400, 550, `闪烁次数: ${this.flashCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });
    this.flashCountText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否按下右键
      if (pointer.rightButtonDown()) {
        this.triggerFlash();
      }
    });

    // 启用右键上下文菜单（可选，防止浏览器默认右键菜单）
    this.input.mouse.disableContextMenu();
  }

  triggerFlash() {
    // 触发相机闪烁效果
    // 参数：flash(duration, red, green, blue, force, callback, context)
    // 白色闪烁，持续 2000ms (2秒)
    this.mainCamera.flash(2000, 255, 255, 255, false, (camera, progress) => {
      // 闪烁完成后的回调
      if (progress === 1) {
        console.log('Flash effect completed');
      }
    });

    // 更新闪烁计数
    this.flashCount++;
    this.flashCountText.setText(`闪烁次数: ${this.flashCount}`);
    
    console.log(`Flash triggered! Total count: ${this.flashCount}`);
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
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);