class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 绘制背景网格作为视觉参照
    const graphics = this.add.graphics();
    
    // 绘制彩色方块网格
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const colorIndex = (row + col) % colors.length;
        graphics.fillStyle(colors[colorIndex], 1);
        graphics.fillRect(col * 160, row * 150, 150, 140);
      }
    }

    // 添加提示文字
    const instructionText = this.add.text(400, 300, '点击鼠标左键触发闪烁效果', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    instructionText.setOrigin(0.5);

    // 显示闪烁次数的文字
    this.flashCountText = this.add.text(400, 50, `闪烁次数: ${this.flashCount}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    });
    this.flashCountText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键（button === 0）
      if (pointer.leftButtonDown()) {
        // 触发相机闪烁效果
        // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制重启
        camera.flash(4000, 255, 255, 255, false);
        
        // 更新状态信号
        this.flashCount++;
        this.flashCountText.setText(`闪烁次数: ${this.flashCount}`);
        
        // 控制台输出，便于验证
        console.log(`相机闪烁触发 #${this.flashCount}，持续 4 秒`);
      }
    });

    // 监听闪烁完成事件（可选，用于调试）
    camera.on('cameraflashcomplete', () => {
      console.log('闪烁效果完成');
    });

    // 监听闪烁开始事件（可选，用于调试）
    camera.on('cameraflashstart', () => {
      console.log('闪烁效果开始');
    });
  }

  update(time, delta) {
    // 本例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
const game = new Phaser.Game(config);