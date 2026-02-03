class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 当前重力方向
    this.gravitySwitchCount = 0; // 重力切换次数（用于验证）
    this.gravityMagnitude = 300; // 重力大小
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(12, 12, 12);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建 20 个物体，使用固定种子确保位置可重现
    this.objects = this.physics.add.group();
    const seed = 12345;
    let random = this.seededRandom(seed);
    
    for (let i = 0; i < 20; i++) {
      const x = 50 + random() * 700;
      const y = 50 + random() * 500;
      const obj = this.objects.create(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      obj.setVelocity(
        (random() - 0.5) * 100,
        (random() - 0.5) * 100
      );
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键作为备选
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 监听按键事件（使用 justDown 避免重复触发）
    this.lastGravitySwitch = 0;
    this.gravityCooldown = 200; // 200ms 冷却时间

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 显示操作提示
    this.add.text(10, 560, 'Use Arrow Keys or WASD to switch gravity direction', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    const canSwitch = time - this.lastGravitySwitch > this.gravityCooldown;

    if (canSwitch) {
      // 检测方向键输入
      if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
          Phaser.Input.Keyboard.JustDown(this.keys.w)) {
        this.setGravity(0, -this.gravityMagnitude, 'up');
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
                 Phaser.Input.Keyboard.JustDown(this.keys.s)) {
        this.setGravity(0, this.gravityMagnitude, 'down');
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
                 Phaser.Input.Keyboard.JustDown(this.keys.a)) {
        this.setGravity(-this.gravityMagnitude, 0, 'left');
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
                 Phaser.Input.Keyboard.JustDown(this.keys.d)) {
        this.setGravity(this.gravityMagnitude, 0, 'right');
      }
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;

    // 更新状态
    this.gravityDirection = direction;
    this.gravitySwitchCount++;
    this.lastGravitySwitch = this.time.now;

    // 更新显示
    this.updateStatusText();

    // 给玩家一个小的初始速度，使效果更明显
    if (direction === 'up') {
      this.player.setVelocityY(-50);
    } else if (direction === 'down') {
      this.player.setVelocityY(50);
    } else if (direction === 'left') {
      this.player.setVelocityX(-50);
    } else if (direction === 'right') {
      this.player.setVelocityX(50);
    }
  }

  updateStatusText() {
    this.statusText.setText([
      `Gravity Direction: ${this.gravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);
  }

  // 简单的伪随机数生成器（用于可重现的随机位置）
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
      gravity: { x: 0, y: 300 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);