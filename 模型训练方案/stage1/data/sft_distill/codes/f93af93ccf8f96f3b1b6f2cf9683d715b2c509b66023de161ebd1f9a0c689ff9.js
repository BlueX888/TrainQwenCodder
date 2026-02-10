class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 可验证的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 绘制背景网格，方便观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制棋盘格背景
    for (let x = 0; x < 800; x += 50) {
      for (let y = 0; y < 600; y += 50) {
        const color = ((x / 50) + (y / 50)) % 2 === 0 ? 0x333333 : 0x555555;
        graphics.fillStyle(color, 1);
        graphics.fillRect(x, y, 50, 50);
      }
    }

    // 绘制中心标记物
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 30);
    
    graphics.lineStyle(4, 0xffffff, 1);
    graphics.strokeCircle(400, 300, 30);

    // 添加文本提示
    this.add.text(400, 100, 'Click to Shake Camera', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 显示抖动次数（可验证的状态信号）
    this.shakeText = this.add.text(400, 150, `Shake Count: ${this.shakeCount}`, {
      fontSize: '24px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 添加状态指示器
    this.statusText = this.add.text(400, 500, 'Status: Ready', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为左键
      if (pointer.leftButtonDown()) {
        // 触发相机抖动效果
        // 参数：持续时间(ms), 强度, 是否强制, 回调, 回调上下文
        this.cameras.main.shake(1500, 0.01);
        
        // 更新状态
        this.shakeCount++;
        this.shakeText.setText(`Shake Count: ${this.shakeCount}`);
        this.statusText.setText('Status: Shaking...');
        this.statusText.setColor('#ff0000');

        // 1.5秒后恢复状态文本
        this.time.delayedCall(1500, () => {
          this.statusText.setText('Status: Ready');
          this.statusText.setColor('#ffff00');
        });
      }
    });

    // 监听相机抖动完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      console.log('Camera shake completed. Total shakes:', this.shakeCount);
    });

    // 添加说明文本
    this.add.text(10, 10, 'Left Click: Trigger shake (1.5s)', {
      fontSize: '16px',
      color: '#cccccc'
    });

    // 显示相机信息
    this.cameraInfo = this.add.text(10, 580, '', {
      fontSize: '14px',
      color: '#aaaaaa'
    });
  }

  update(time, delta) {
    // 更新相机信息显示
    const cam = this.cameras.main;
    this.cameraInfo.setText(
      `Camera: x=${cam.scrollX.toFixed(1)} y=${cam.scrollY.toFixed(1)} ` +
      `zoom=${cam.zoom.toFixed(2)} rotation=${cam.rotation.toFixed(2)}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);