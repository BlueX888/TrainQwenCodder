class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号
  }

  preload() {
    // 创建红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('redBox', 40, 40);
    graphics.destroy();
  }

  create() {
    // 创建3个红色对象
    this.objects = [];
    
    // 对象1 - 左侧
    const obj1 = this.physics.add.sprite(200, 300, 'redBox');
    obj1.setCollideWorldBounds(true);
    this.objects.push(obj1);
    
    // 对象2 - 中间
    const obj2 = this.physics.add.sprite(400, 300, 'redBox');
    obj2.setCollideWorldBounds(true);
    this.objects.push(obj2);
    
    // 对象3 - 右侧
    const obj3 = this.physics.add.sprite(600, 300, 'redBox');
    obj3.setCollideWorldBounds(true);
    this.objects.push(obj3);
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加WASD键作为备选控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 显示移动次数
    this.moveText = this.add.text(16, 16, 'Move Count: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    
    // 显示说明
    this.add.text(16, 50, 'Use Arrow Keys or WASD to move all objects', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update() {
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;
    
    // 检测方向键输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      velocityX = -200;
      isMoving = true;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      velocityX = 200;
      isMoving = true;
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      velocityY = -200;
      isMoving = true;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      velocityY = 200;
      isMoving = true;
    }
    
    // 同步设置所有对象的速度
    this.objects.forEach(obj => {
      obj.setVelocity(velocityX, velocityY);
    });
    
    // 更新移动次数（当开始移动时计数）
    if (isMoving && (velocityX !== 0 || velocityY !== 0)) {
      // 使用时间节流，避免每帧都计数
      if (!this.lastMoveTime || this.time.now - this.lastMoveTime > 200) {
        this.moveCount++;
        this.moveText.setText('Move Count: ' + this.moveCount);
        this.lastMoveTime = this.time.now;
      }
    }
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