class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和一些可视元素以便观察闪烁效果
    const graphics = this.add.graphics();
    
    // 绘制彩色网格背景
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 6; y++) {
        const color = (x + y) % 2 === 0 ? 0x3498db : 0x2ecc71;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x * 100, y * 100, 100, 100);
      }
    }

    // 添加中心圆形
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(400, 300, 80);

    // 添加提示文本
    const style = {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };
    
    this.instructionText = this.add.text(400, 50, '右键点击触发闪烁效果', style);
    this.instructionText.setOrigin(0.5);

    // 显示闪烁计数
    this.countText = this.add.text(400, 550, `闪烁次数: ${this.flashCount}`, style);
    this.countText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标按下事件
    this.input.on('pointerdown', (pointer) => {
      // 判断是否为右键点击 (button === 2)
      if (pointer.rightButtonDown()) {
        this.triggerFlash();
      }
    });

    // 启用右键上下文菜单（可选，但为了更好的用户体验建议禁用）
    this.input.mouse.disableContextMenu();

    console.log('游戏已启动，请右键点击屏幕触发相机闪烁效果');
  }

  triggerFlash() {
    // 触发相机闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 强制, 回调, 上下文
    this.mainCamera.flash(
      2000,        // 持续 2 秒
      255,         // 红色分量
      255,         // 绿色分量
      255,         // 蓝色分量
      false,       // 不强制重启效果
      (camera, progress) => {
        // 闪烁完成回调
        if (progress === 1) {
          this.flashCount++;
          this.countText.setText(`闪烁次数: ${this.flashCount}`);
          console.log(`闪烁效果完成，总次数: ${this.flashCount}`);
        }
      }
    );

    console.log('触发闪烁效果，持续 2 秒');
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
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);