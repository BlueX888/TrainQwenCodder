class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格作为抖动效果的视觉参考
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建一些彩色方块作为参考物
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    for (let i = 0; i < 5; i++) {
      const box = this.add.graphics();
      box.fillStyle(colors[i], 1);
      box.fillRect(0, 0, 80, 80);
      box.x = 100 + i * 150;
      box.y = 260;
    }

    // 添加提示文本
    const text = this.add.text(400, 100, '右键点击触发相机抖动', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 显示抖动次数的文本
    this.shakeText = this.add.text(400, 500, `抖动次数: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.shakeText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 监听鼠标按下事件
    this.input.on('pointerdown', (pointer) => {
      // 判断是否为右键（button === 2）
      if (pointer.rightButtonDown()) {
        // 触发相机抖动效果
        // 参数：持续时间(ms), 强度(默认0.05), 力度衰减, 回调
        camera.shake(1500, 0.01);
        
        // 更新抖动次数
        this.shakeCount++;
        this.shakeText.setText(`抖动次数: ${this.shakeCount}`);
        
        console.log(`相机抖动触发 - 第 ${this.shakeCount} 次`);
      }
    });

    // 监听相机抖动完成事件（可选）
    camera.on('camerashakecomplete', () => {
      console.log('相机抖动效果结束');
    });

    // 添加左键点击的提示（用于对比）
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        console.log('左键点击 - 无效果');
      }
    });
  }

  update(time, delta) {
    // 本例中不需要更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  // 禁用右键菜单，确保右键事件能被捕获
  input: {
    mouse: {
      preventDefaultWheel: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 禁用浏览器右键菜单
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
});