class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.objectCount = 15;
    this.moveFrames = 0; // 验证信号：记录移动帧数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 使用 Graphics 生成蓝色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // 蓝色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('blueBox', 32, 32);
    graphics.destroy();

    // 创建 15 个蓝色对象，随机分布
    for (let i = 0; i < this.objectCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.physics.add.sprite(x, y, 'blueBox');
      obj.setCollideWorldBounds(true); // 限制在场景内
      this.objects.push(obj);
    }

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.updateStatusText();

    console.log(`Created ${this.objectCount} blue objects`);
  }

  update(time, delta) {
    let isMoving = false;
    const speed = 160;

    // 重置所有对象速度
    this.objects.forEach(obj => {
      obj.setVelocity(0, 0);
    });

    // 检测方向键并同步移动所有对象
    if (this.cursors.left.isDown) {
      this.objects.forEach(obj => {
        obj.setVelocityX(-speed);
      });
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      this.objects.forEach(obj => {
        obj.setVelocityX(speed);
      });
      isMoving = true;
    }

    if (this.cursors.up.isDown) {
      this.objects.forEach(obj => {
        obj.setVelocityY(-speed);
      });
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      this.objects.forEach(obj => {
        obj.setVelocityY(speed);
      });
      isMoving = true;
    }

    // 如果有移动，增加移动帧计数
    if (isMoving) {
      this.moveFrames++;
    }

    // 更新状态显示
    this.updateStatusText();
  }

  updateStatusText() {
    // 计算所有对象的平均位置作为额外验证信号
    let avgX = 0;
    let avgY = 0;
    this.objects.forEach(obj => {
      avgX += obj.x;
      avgY += obj.y;
    });
    avgX = Math.round(avgX / this.objectCount);
    avgY = Math.round(avgY / this.objectCount);

    this.statusText.setText([
      `Objects: ${this.objectCount}`,
      `Move Frames: ${this.moveFrames}`,
      `Avg Position: (${avgX}, ${avgY})`,
      `Use Arrow Keys to Move All Objects`
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