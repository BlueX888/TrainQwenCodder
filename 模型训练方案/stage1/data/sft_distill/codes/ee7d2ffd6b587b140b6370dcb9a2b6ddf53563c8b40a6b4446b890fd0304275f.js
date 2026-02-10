class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.shakeStatus = 'pending'; // 状态信号：pending, shaking, completed
    this.shakeCount = 0; // 抖动次数计数器
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格用于更明显地观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制背景色
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // 绘制网格线
    graphics.lineStyle(2, 0x16213e, 0.8);
    const gridSize = 50;
    
    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 创建中心参考物体 - 一个彩色方块
    const centerBox = this.add.graphics();
    centerBox.fillStyle(0xff6b6b, 1);
    centerBox.fillRect(-50, -50, 100, 100);
    centerBox.setPosition(width / 2, height / 2);

    // 添加边框
    centerBox.lineStyle(4, 0xffffff, 1);
    centerBox.strokeRect(-50, -50, 100, 100);

    // 添加四个角落的标记点
    const cornerSize = 20;
    const corners = [
      { x: cornerSize, y: cornerSize },
      { x: width - cornerSize, y: cornerSize },
      { x: cornerSize, y: height - cornerSize },
      { x: width - cornerSize, y: height - cornerSize }
    ];

    corners.forEach(pos => {
      const corner = this.add.graphics();
      corner.fillStyle(0x4ecdc4, 1);
      corner.fillCircle(pos.x, pos.y, 10);
    });

    // 创建状态显示文本
    this.statusText = this.add.text(width / 2, 50, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    this.instructionText = this.add.text(width / 2, height - 50, 
      'Watch the grid and objects shake!', {
      fontSize: '18px',
      color: '#4ecdc4',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 更新初始状态
    this.updateStatusText();

    // 获取主相机并开始抖动
    const camera = this.cameras.main;
    
    // 设置抖动状态
    this.shakeStatus = 'shaking';
    this.shakeCount++;
    this.updateStatusText();

    // 执行抖动效果
    // 参数：duration(ms), intensity(抖动强度), force(是否强制重新开始)
    camera.shake(1000, 0.01);

    // 监听抖动完成事件
    camera.once('camerashakecomplete', () => {
      this.shakeStatus = 'completed';
      this.updateStatusText();
      
      // 抖动完成后，显示提示信息
      this.time.delayedCall(500, () => {
        this.instructionText.setText('Shake completed! Click to shake again.');
      });
    });

    // 添加点击重新抖动功能
    this.input.on('pointerdown', () => {
      if (this.shakeStatus === 'completed') {
        this.shakeStatus = 'shaking';
        this.shakeCount++;
        this.updateStatusText();
        
        camera.shake(1000, 0.01);
        
        camera.once('camerashakecomplete', () => {
          this.shakeStatus = 'completed';
          this.updateStatusText();
        });
      }
    });
  }

  updateStatusText() {
    const statusMessages = {
      'pending': 'Status: Pending',
      'shaking': `Status: SHAKING... (Count: ${this.shakeCount})`,
      'completed': `Status: Completed (Total: ${this.shakeCount})`
    };

    this.statusText.setText(statusMessages[this.shakeStatus]);
    
    // 根据状态改变文本颜色
    const colors = {
      'pending': '#ffffff',
      'shaking': '#ff6b6b',
      'completed': '#4ecdc4'
    };
    this.statusText.setColor(colors[this.shakeStatus]);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: ShakeScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);