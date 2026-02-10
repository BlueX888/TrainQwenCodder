class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objectCount = 0; // 状态信号：对象数量
    this.isMoving = false; // 状态信号：是否有对象在移动
    this.totalDistance = 0; // 状态信号：累计移动距离
  }

  preload() {
    // 使用Graphics创建白色纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('whiteBox', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建物理组来管理20个对象
    this.objects = this.physics.add.group();

    // 创建20个白色对象，排列成4x5网格
    const rows = 4;
    const cols = 5;
    const startX = 200;
    const startY = 150;
    const spacingX = 100;
    const spacingY = 100;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const obj = this.physics.add.sprite(x, y, 'whiteBox');
        obj.setCollideWorldBounds(true); // 限制在世界边界内
        this.objects.add(obj);
        this.objectCount++;
      }
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
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
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      velocityY = speed;
    }

    // 同步设置所有对象的速度
    this.isMoving = velocityX !== 0 || velocityY !== 0;
    
    this.objects.children.entries.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });

    // 计算累计移动距离
    if (this.isMoving) {
      const distance = Math.sqrt(velocityX * velocityX + velocityY * velocityY) * (delta / 1000);
      this.totalDistance += distance;
    }

    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Objects: ${this.objectCount}`,
      `Moving: ${this.isMoving ? 'YES' : 'NO'}`,
      `Total Distance: ${Math.floor(this.totalDistance)}px`,
      `Controls: Arrow Keys or WASD`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);