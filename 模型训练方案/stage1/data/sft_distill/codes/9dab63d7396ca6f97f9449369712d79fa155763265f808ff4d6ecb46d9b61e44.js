class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.fadeCount = 0; // 状态信号：记录淡入淡出触发次数
    this.isAnimating = false; // 防止动画进行中重复触发
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和一些可见元素
    const graphics = this.add.graphics();
    
    // 绘制彩色背景网格
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181];
        const color = colors[(row + col) % colors.length];
        graphics.fillStyle(color, 1);
        graphics.fillRect(col * 100, row * 100, 95, 95);
      }
    }

    // 添加中心文字提示
    const centerText = this.add.text(400, 250, '右键点击触发淡入淡出', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    centerText.setOrigin(0.5);

    // 添加计数器显示
    this.counterText = this.add.text(400, 320, `触发次数: ${this.fadeCount}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    });
    this.counterText.setOrigin(0.5);

    // 添加状态指示器
    this.statusText = this.add.text(400, 370, '状态: 就绪', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 15, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 监听鼠标右键按下事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为右键点击且动画未在进行中
      if (pointer.rightButtonDown() && !this.isAnimating) {
        this.isAnimating = true;
        this.fadeCount++;
        this.counterText.setText(`触发次数: ${this.fadeCount}`);
        this.statusText.setText('状态: 淡出中...');
        this.statusText.setColor('#ff0000');

        console.log(`触发淡入淡出效果 - 第 ${this.fadeCount} 次`);

        // 先淡出（0.25秒）
        camera.fadeOut(250, 0, 0, 0);

        // 监听淡出完成事件
        camera.once('camerafadeoutcomplete', () => {
          console.log('淡出完成，开始淡入');
          this.statusText.setText('状态: 淡入中...');
          this.statusText.setColor('#ffff00');

          // 淡出完成后立即淡入（0.25秒）
          camera.fadeIn(250, 0, 0, 0);
        });

        // 监听淡入完成事件
        camera.once('camerafadeincomplete', () => {
          console.log('淡入完成');
          this.statusText.setText('状态: 就绪');
          this.statusText.setColor('#00ff00');
          this.isAnimating = false;
        });
      }
    });

    // 添加右键菜单禁用（可选，防止浏览器默认右键菜单）
    this.input.mouse.disableContextMenu();

    // 添加说明文字
    this.add.text(10, 10, '提示：右键点击屏幕触发效果', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 本示例不需要持续更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);