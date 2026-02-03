class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证状态：总移动距离
    this.moveCount = 0; // 可验证状态：移动次数
  }

  preload() {
    // 使用Graphics创建白色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('whiteCircle', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建20个白色对象
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'whiteCircle');
      this.objects.push(obj);
    }

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键支持
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    const speed = 160;
    const deltaSeconds = delta / 1000;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = speed;
    }

    // 如果有移动输入，同步移动所有对象
    if (velocityX !== 0 || velocityY !== 0) {
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;
      
      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance * 20; // 20个对象的总距离
      this.moveCount++;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        let newX = obj.x + moveX;
        let newY = obj.y + moveY;

        // 边界检测（保持对象在屏幕内）
        newX = Phaser.Math.Clamp(newX, 16, 784);
        newY = Phaser.Math.Clamp(newY, 16, 584);

        obj.setPosition(newX, newY);
      });

      // 更新状态显示
      if (this.moveCount % 10 === 0) {
        this.updateStatusText();
      }
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.objects.length}\n` +
      `Total Distance: ${Math.floor(this.totalDistance)}\n` +
      `Move Count: ${this.moveCount}\n` +
      `Use Arrow Keys or WASD to move`
    );
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