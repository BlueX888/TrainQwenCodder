class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistanceMoved = 0; // 可验证的状态信号
    this.activeObjects = 20; // 活跃对象数量
  }

  preload() {
    // 使用 Graphics 创建粉色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(16, 16, 16); // 圆形对象，半径16
    graphics.generateTexture('pinkObject', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建 20 个粉色对象
    for (let i = 0; i < 20; i++) {
      // 随机位置，确保不超出边界
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      
      const obj = this.physics.add.sprite(x, y, 'pinkObject');
      obj.setCollideWorldBounds(true); // 防止对象移出边界
      this.objects.push(obj);
    }

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录上一帧的位置用于计算移动距离
    this.lastPositions = this.objects.map(obj => ({ x: obj.x, y: obj.y }));

    this.updateInfoText();
  }

  update(time, delta) {
    const speed = 240;
    let velocityX = 0;
    let velocityY = 0;

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocityX = -speed;
    } else if (this.cursors.right.isDown) {
      velocityX = speed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -speed;
    } else if (this.cursors.down.isDown) {
      velocityY = speed;
    }

    // 同步更新所有对象的速度
    let isMoving = velocityX !== 0 || velocityY !== 0;
    
    this.objects.forEach((obj, index) => {
      obj.setVelocity(velocityX, velocityY);

      // 计算移动距离
      if (isMoving) {
        const lastPos = this.lastPositions[index];
        const distance = Phaser.Math.Distance.Between(
          lastPos.x, lastPos.y,
          obj.x, obj.y
        );
        this.totalDistanceMoved += distance;
      }

      // 更新上一帧位置
      this.lastPositions[index] = { x: obj.x, y: obj.y };
    });

    this.updateInfoText();
  }

  updateInfoText() {
    this.infoText.setText([
      `Active Objects: ${this.activeObjects}`,
      `Total Distance: ${Math.floor(this.totalDistanceMoved)}px`,
      `Use Arrow Keys to Move All Objects`,
      `Speed: 240`
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);