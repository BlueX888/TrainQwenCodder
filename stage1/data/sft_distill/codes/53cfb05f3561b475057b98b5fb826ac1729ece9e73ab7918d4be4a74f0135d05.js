class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.objectCount = 15; // 状态信号：物体数量
    this.gravityMagnitude = 1000; // 状态信号：重力大小
  }

  preload() {
    // 创建玩家纹理 - 蓝色方块
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理 - 红色圆形
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建背景网格纹理
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.3);
    for (let i = 0; i <= 800; i += 50) {
      gridGraphics.lineBetween(i, 0, i, 600);
    }
    for (let i = 0; i <= 600; i += 50) {
      gridGraphics.lineBetween(0, i, 800, i);
    }
    gridGraphics.generateTexture('grid', 800, 600);
    gridGraphics.destroy();
  }

  create() {
    // 添加背景网格
    this.add.image(400, 300, 'grid');

    // 设置世界边界
    this.physics.world.setBounds(0, 0, 800, 600);
    this.physics.world.setBoundsCollision(true, true, true, true);

    // 初始重力向下
    this.physics.world.setGravity(0, this.gravityMagnitude);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    this.player.setDamping(true);
    this.player.setDrag(0.95);

    // 创建物体组
    this.objects = this.physics.add.group();

    // 使用固定种子生成15个物体的位置（确定性）
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < this.objectCount; i++) {
      const x = 100 + random() * 600;
      const y = 100 + random() * 400;
      const obj = this.objects.create(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      obj.setDamping(true);
      obj.setDrag(0.95);
    }

    // 物体之间的碰撞
    this.physics.add.collider(this.objects, this.objects);
    this.physics.add.collider(this.player, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建UI文本
    this.gravityText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(10, 50, 
      'Arrow Keys / WASD: Change Gravity Direction', {
      fontSize: '16px',
      fill: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示
    this.updateGravityText();

    // 键盘按下标志（避免重复触发）
    this.lastGravityChange = 0;
  }

  update(time, delta) {
    // 防抖：每200ms最多改变一次重力
    if (time - this.lastGravityChange < 200) {
      return;
    }

    let gravityChanged = false;

    // 检测方向键输入
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      // 重力向上
      this.physics.world.setGravity(0, -this.gravityMagnitude);
      this.gravityDirection = 'UP';
      gravityChanged = true;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      // 重力向下
      this.physics.world.setGravity(0, this.gravityMagnitude);
      this.gravityDirection = 'DOWN';
      gravityChanged = true;
    } else if (this.cursors.left.isDown || this.keys.a.isDown) {
      // 重力向左
      this.physics.world.setGravity(-this.gravityMagnitude, 0);
      this.gravityDirection = 'LEFT';
      gravityChanged = true;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      // 重力向右
      this.physics.world.setGravity(this.gravityMagnitude, 0);
      this.gravityDirection = 'RIGHT';
      gravityChanged = true;
    }

    if (gravityChanged) {
      this.lastGravityChange = time;
      this.updateGravityText();
      
      // 给玩家一个小的初始速度，使重力效果更明显
      const impulse = 50;
      switch(this.gravityDirection) {
        case 'UP':
          this.player.setVelocityY(-impulse);
          break;
        case 'DOWN':
          this.player.setVelocityY(impulse);
          break;
        case 'LEFT':
          this.player.setVelocityX(-impulse);
          break;
        case 'RIGHT':
          this.player.setVelocityX(impulse);
          break;
      }
    }
  }

  updateGravityText() {
    const arrows = {
      'UP': '↑',
      'DOWN': '↓',
      'LEFT': '←',
      'RIGHT': '→'
    };
    this.gravityText.setText(
      `Gravity: ${arrows[this.gravityDirection]} ${this.gravityDirection} (${this.gravityMagnitude})\n` +
      `Objects: ${this.objectCount} | Player: Active`
    );
  }

  // 简单的种子随机数生成器（确保确定性）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);