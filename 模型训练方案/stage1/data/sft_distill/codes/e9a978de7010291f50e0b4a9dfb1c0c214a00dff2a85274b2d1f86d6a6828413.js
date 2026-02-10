class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeComplete = false; // 状态信号：抖动是否完成
    this.shakeStarted = false;  // 状态信号：抖动是否已开始
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x2c3e50, 1);
    background.fillRect(0, 0, width, height);

    // 创建网格线，方便观察抖动效果
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x34495e, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      gridGraphics.lineBetween(0, y, width, y);
    }

    // 创建中心标记物体
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xe74c3c, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 40);
    
    // 添加文字说明
    const titleText = this.add.text(width / 2, 100, 'Camera Shake Effect', {
      fontSize: '32px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    const statusText = this.add.text(width / 2, height - 100, 'Shaking...', {
      fontSize: '24px',
      color: '#f39c12'
    });
    statusText.setOrigin(0.5);

    // 添加一些装饰方块
    for (let i = 0; i < 5; i++) {
      const boxGraphics = this.add.graphics();
      const x = 100 + i * 150;
      const y = height / 2 + 150;
      const color = [0x3498db, 0x2ecc71, 0x9b59b6, 0xf1c40f, 0xe67e22][i];
      
      boxGraphics.fillStyle(color, 1);
      boxGraphics.fillRect(x - 30, y - 30, 60, 60);
    }

    // 开始相机抖动效果
    // 参数：duration(持续时间), intensity(强度), force(是否强制), callback(完成回调)
    this.shakeStarted = true;
    
    this.cameras.main.shake(1000, 0.01, false, (camera, progress) => {
      // progress 从 0 到 1，表示抖动进度
      if (progress === 1) {
        this.shakeComplete = true;
        statusText.setText('Shake Complete!');
        statusText.setColor('#2ecc71');
        
        console.log('Camera shake completed!');
      } else {
        // 更新进度显示
        const percentage = Math.floor(progress * 100);
        statusText.setText(`Shaking... ${percentage}%`);
      }
    });

    // 添加调试信息
    const debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#95a5a6',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 存储引用以便在 update 中使用
    this.debugText = debugText;
    this.statusText = statusText;
  }

  update(time, delta) {
    // 更新调试信息
    if (this.debugText) {
      this.debugText.setText([
        `Shake Started: ${this.shakeStarted}`,
        `Shake Complete: ${this.shakeComplete}`,
        `Time: ${Math.floor(time / 1000)}s`,
        `Camera X: ${this.cameras.main.scrollX.toFixed(2)}`,
        `Camera Y: ${this.cameras.main.scrollY.toFixed(2)}`
      ]);
    }

    // 抖动完成后可以添加后续逻辑
    if (this.shakeComplete && !this.nextActionTriggered) {
      this.nextActionTriggered = true;
      
      // 例如：2秒后重新抖动
      this.time.delayedCall(2000, () => {
        this.shakeComplete = false;
        this.statusText.setText('Shaking Again...');
        this.statusText.setColor('#f39c12');
        
        this.cameras.main.shake(1000, 0.015, false, (camera, progress) => {
          if (progress === 1) {
            this.shakeComplete = true;
            this.statusText.setText('All Shakes Complete!');
            this.statusText.setColor('#2ecc71');
          }
        });
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  // 可选：添加物理系统（本例不需要）
  // physics: {
  //   default: 'arcade',
  //   arcade: { debug: false }
  // }
};

// 创建游戏实例
const game = new Phaser.Game(config);