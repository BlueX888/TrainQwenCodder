class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录抖动触发次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，用于观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制一些彩色方块作为参考物体
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const rect = this.add.graphics();
      rect.fillStyle(colors[i], 1);
      rect.fillRect(0, 0, 80, 80);
      rect.x = 150 + i * 120;
      rect.y = 260;
    }

    // 添加中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0xffffff, 1);
    circle.fillCircle(400, 300, 40);

    // 添加提示文本
    const text = this.add.text(400, 100, '右键点击触发相机抖动', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 500, '抖动次数: 0', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听鼠标按下事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为右键点击（button === 2）
      if (pointer.rightButtonDown()) {
        // 触发相机抖动效果
        // 参数：持续时间(ms), 强度, 是否强制, 回调, 上下文
        this.cameras.main.shake(1500, 0.01);
        
        // 更新状态
        this.shakeCount++;
        this.statusText.setText(`抖动次数: ${this.shakeCount}`);
        
        console.log(`相机抖动触发 #${this.shakeCount}`);
      }
    });

    // 监听相机抖动完成事件（可选，用于验证）
    this.cameras.main.on('camerashakecomplete', () => {
      console.log('相机抖动完成');
    });

    // 添加额外说明
    const hint = this.add.text(10, 10, '提示：某些浏览器可能会拦截右键菜单\n可以尝试多次右键点击', {
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#000000aa',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  // 禁用右键菜单，确保能捕获右键事件
  input: {
    mouse: {
      preventDefaultWheel: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 禁用页面右键菜单，确保右键事件能被游戏捕获
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});