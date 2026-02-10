class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录抖动触发次数
    this.isShaking = false; // 状态信号：当前是否正在抖动
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格，便于观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制棋盘格背景
    const gridSize = 50;
    for (let y = 0; y < this.cameras.main.height; y += gridSize) {
      for (let x = 0; x < this.cameras.main.width; x += gridSize) {
        const isEven = ((x / gridSize) + (y / gridSize)) % 2 === 0;
        graphics.fillStyle(isEven ? 0x333333 : 0x555555, 1);
        graphics.fillRect(x, y, gridSize, gridSize);
      }
    }

    // 添加中心圆形标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 30);

    // 添加文本提示
    const instructionText = this.add.text(400, 50, '点击鼠标左键触发相机抖动', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 显示抖动次数的文本
    this.statusText = this.add.text(400, 550, `抖动次数: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 只响应左键点击
      if (pointer.leftButtonDown()) {
        this.triggerCameraShake();
      }
    });

    console.log('游戏初始化完成，点击鼠标左键触发抖动效果');
  }

  triggerCameraShake() {
    // 如果已经在抖动中，则不重复触发
    if (this.isShaking) {
      console.log('相机正在抖动中，请等待完成');
      return;
    }

    // 更新状态
    this.isShaking = true;
    this.shakeCount++;

    // 更新显示文本
    this.statusText.setText(`抖动次数: ${this.shakeCount} (抖动中...)`);
    this.statusText.setColor('#ffff00');

    console.log(`触发第 ${this.shakeCount} 次抖动`);

    // 触发相机抖动效果
    // 参数：持续时间(ms), 强度, 是否强制, 回调函数
    this.cameras.main.shake(1500, 0.01, false, (camera, progress) => {
      // 抖动完成时的回调（progress === 1）
      if (progress === 1) {
        this.isShaking = false;
        this.statusText.setText(`抖动次数: ${this.shakeCount}`);
        this.statusText.setColor('#00ff00');
        console.log(`抖动完成，总计 ${this.shakeCount} 次`);
      }
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
  parent: 'game-container' // 可选：指定挂载的 DOM 元素
};

// 创建游戏实例
const game = new Phaser.Game(config);