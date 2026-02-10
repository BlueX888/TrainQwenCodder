class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeCount = 0; // 状态信号：记录淡入淡出触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些装饰元素
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillCircle(200, 200, 80);
    
    graphics.fillStyle(0xe24a4a, 1);
    graphics.fillRect(500, 150, 120, 120);
    
    graphics.fillStyle(0x4ae290, 1);
    graphics.fillCircle(400, 450, 60);

    // 创建提示文本
    this.instructionText = this.add.text(400, 50, '右键点击触发淡入淡出效果', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    });
    this.instructionText.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(400, 550, `触发次数: ${this.fadeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 判断是否为右键点击
      if (pointer.rightButtonDown()) {
        this.triggerFadeEffect();
      }
    });

    // 启用右键菜单禁用（可选，避免浏览器右键菜单干扰）
    this.input.mouse.disableContextMenu();
  }

  triggerFadeEffect() {
    // 增加触发次数
    this.fadeCount++;
    
    // 更新状态文本
    this.statusText.setText(`触发次数: ${this.fadeCount}`);

    // 淡出效果：500ms 淡出到黑色
    this.mainCamera.fadeOut(500, 0, 0, 0);

    // 监听淡出完成事件
    this.mainCamera.once('camerafadeoutcomplete', () => {
      // 淡出完成后，立即开始淡入效果：500ms 从黑色淡入
      this.mainCamera.fadeIn(500, 0, 0, 0);
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
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);