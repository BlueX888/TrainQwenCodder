class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 可验证的状态信号：记录抖动触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格，便于观察抖动效果
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.3);
    
    // 绘制网格线
    for (let x = 0; x < width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 创建中心参考圆形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff0000, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 30);

    // 创建边角参考矩形
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x0000ff, 1);
    cornerGraphics.fillRect(20, 20, 60, 60);
    cornerGraphics.fillRect(width - 80, 20, 60, 60);
    cornerGraphics.fillRect(20, height - 80, 60, 60);
    cornerGraphics.fillRect(width - 80, height - 80, 60, 60);

    // 添加提示文本
    const instructionText = this.add.text(width / 2, 50, 'Click to Shake Camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示抖动次数的文本
    this.shakeCountText = this.add.text(width / 2, height - 50, `Shake Count: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.shakeCountText.setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 触发相机抖动效果
      // 参数：持续时间(ms), 强度(默认0.05), 是否强制重启(默认false)
      this.cameras.main.shake(1500, 0.01);
      
      // 更新抖动计数
      this.shakeCount++;
      this.shakeCountText.setText(`Shake Count: ${this.shakeCount}`);
      
      // 在控制台输出状态信息
      console.log(`Camera shake triggered! Total shakes: ${this.shakeCount}`);
    });

    // 监听相机抖动完成事件（可选）
    this.cameras.main.on('camerashakecomplete', () => {
      console.log('Camera shake completed');
    });

    // 添加额外的视觉反馈：显示当前是否在抖动
    this.statusText = this.add.text(20, height - 30, 'Status: Idle', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // 监听抖动开始事件
    this.cameras.main.on('camerashakestart', () => {
      this.statusText.setText('Status: Shaking...').setColor('#ff0000');
    });

    // 监听抖动完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      this.statusText.setText('Status: Idle').setColor('#00ff00');
    });
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
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