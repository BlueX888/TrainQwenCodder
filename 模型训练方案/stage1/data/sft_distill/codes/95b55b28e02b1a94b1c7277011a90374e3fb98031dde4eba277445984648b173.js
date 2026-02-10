class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格，便于观察相机弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    
    // 绘制网格
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建一些彩色方块作为参考物体
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let i = 0; i < 6; i++) {
      const box = this.add.graphics();
      box.fillStyle(colors[i], 1);
      box.fillRect(0, 0, 60, 60);
      box.x = 100 + (i % 3) * 250;
      box.y = 150 + Math.floor(i / 3) * 250;
    }

    // 添加中心圆形作为焦点
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xffffff, 1);
    centerCircle.fillCircle(400, 300, 40);
    centerCircle.lineStyle(4, 0x000000, 1);
    centerCircle.strokeCircle(400, 300, 40);

    // 添加提示文本
    const instructionText = this.add.text(400, 50, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 添加计数器文本
    this.counterText = this.add.text(400, 550, `Shake Count: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.counterText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      // 触发相机弹跳效果
      // 参数：持续时间(ms), 强度, 强制停止之前的效果
      this.mainCamera.shake(2500, 0.01, true);
      
      // 更新计数器
      this.shakeCount++;
      this.counterText.setText(`Shake Count: ${this.shakeCount}`);
      
      console.log(`Camera shake triggered! Count: ${this.shakeCount}`);
    });

    // 监听相机弹跳完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      console.log('Camera shake completed');
    });

    console.log('Game initialized. Press SPACE to trigger camera shake effect.');
  }

  update(time, delta) {
    // 可选：显示相机是否正在弹跳
    if (this.mainCamera.isShaking) {
      this.counterText.setColor('#ff0000');
    } else {
      this.counterText.setColor('#ffff00');
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);