class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录触发次数
    this.isShaking = false; // 防止重复触发
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制网格背景，方便观察弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      graphics.lineBetween(x, 0, x, height);
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      graphics.lineBetween(0, y, width, y);
    }

    // 在中心绘制一个参考圆
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(width / 2, height / 2, 30);

    // 添加提示文本
    const instructionText = this.add.text(width / 2, 50, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructionText.setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(width / 2, 100, `Shake Count: ${this.shakeCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听相机 shake 完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      this.isShaking = false;
      console.log('Camera shake completed');
    });
  }

  update() {
    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isShaking) {
      this.triggerShake();
    }
  }

  triggerShake() {
    // 触发相机弹跳效果
    // shake(duration, intensity, force, callback, context)
    // duration: 1000ms (1秒)
    // intensity: 0.01 (弹跳强度)
    this.cameras.main.shake(1000, 0.01);
    
    this.isShaking = true;
    this.shakeCount++;
    
    // 更新状态显示
    this.statusText.setText(`Shake Count: ${this.shakeCount}`);
    
    console.log(`Camera shake triggered! Count: ${this.shakeCount}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);