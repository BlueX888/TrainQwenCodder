class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeCount = 0; // 状态信号：记录淡入淡出触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和可视元素
    const graphics = this.add.graphics();
    
    // 绘制彩色背景网格
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 6; j++) {
        const color = ((i + j) % 2 === 0) ? 0x3498db : 0x2ecc71;
        graphics.fillStyle(color, 1);
        graphics.fillRect(i * 100, j * 100, 100, 100);
      }
    }

    // 绘制中心圆形
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(400, 300, 80);

    // 添加文本提示
    const text = this.add.text(400, 50, '右键点击触发淡入淡出效果', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 显示触发次数的文本
    this.countText = this.add.text(400, 550, `触发次数: ${this.fadeCount}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.countText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 判断是否为右键
      if (pointer.rightButtonDown()) {
        this.triggerFadeEffect();
      }
    });

    // 提示：需要在浏览器中禁用右键菜单才能正常工作
    this.input.mouse.disableContextMenu();
  }

  triggerFadeEffect() {
    // 增加触发计数
    this.fadeCount++;
    this.countText.setText(`触发次数: ${this.fadeCount}`);

    // 先淡出（持续 250ms）
    this.mainCamera.fadeOut(250, 0, 0, 0);

    // 淡出完成后触发淡入
    this.mainCamera.once('camerafadeoutcomplete', () => {
      // 淡入（持续 250ms）
      this.mainCamera.fadeIn(250, 0, 0, 0);
    });
  }

  update(time, delta) {
    // 可选：添加一些动态效果
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);