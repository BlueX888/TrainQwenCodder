// 四向重力切换游戏
class GravityGame extends Phaser.Scene {
  constructor() {
    super('GravityGame');
    this.gravitySwitchCount = 0;
    this.currentGravityDirection = 'down'; // down, up, left, right
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      gravitySwitchCount: 0,
      currentGravityDirection: 'down',
      playerPosition: { x: 0, y: 0 },
      objectsInBounds: 13, // 玩家 + 12个物体
      timestamp: Date.now()
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff4444, 1);
    objectGraphics.fillCircle(16, 16, 16);
    objectGraphics.generateTexture('object', 32, 32);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建 12 个物体（使用固定位置确保确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 100, y: 150 }, { x: 200, y: 150 }, { x: 300, y: 150 },
      { x: 500, y: 150 }, { x: 600, y: 150 }, { x: 700, y: 150 },
      { x: 150, y: 300 }, { x: 350, y: 300 }, { x: 550, y: 300 },
      { x: 250, y: 450 }, { x: 450, y: 450 }, { x: 650, y: 450 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    });

    // 设置初始重力（向下）
    this.physics.world.gravity.set(0, 200);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加物体间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 添加说明文本
    this.instructionText = this.add.text(10, 10, 
      'Use Arrow Keys to Change Gravity\nCurrent: DOWN | Switches: 0', 
      { 
        fontSize: '16px', 
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(100);

    // 标记按键是否已按下（防止连续触发）
    this.keyPressed = {
      up: false,
      down: false,
      left: false,
      right: false
    };
  }

  update(time, delta) {
    // 检测方向键切换重力
    if (this.cursors.up.isDown && !this.keyPressed.up) {
      this.switchGravity('up');
      this.keyPressed.up = true;
    } else if (this.cursors.up.isUp) {
      this.keyPressed.up = false;
    }

    if (this.cursors.down.isDown && !this.keyPressed.down) {
      this.switchGravity('down');
      this.keyPressed.down = true;
    } else if (this.cursors.down.isUp) {
      this.keyPressed.down = false;
    }

    if (this.cursors.left.isDown && !this.keyPressed.left) {
      this.switchGravity('left');
      this.keyPressed.left = true;
    } else if (this.cursors.left.isUp) {
      this.keyPressed.left = false;
    }

    if (this.cursors.right.isDown && !this.keyPressed.right) {
      this.switchGravity('right');
      this.keyPressed.right = true;
    } else if (this.cursors.right.isUp) {
      this.keyPressed.right = false;
    }

    // 更新信号数据
    this.updateSignals();

    // 更新显示文本
    this.instructionText.setText(
      `Use Arrow Keys to Change Gravity\nCurrent: ${this.currentGravityDirection.toUpperCase()} | Switches: ${this.gravitySwitchCount}`
    );
  }

  switchGravity(direction) {
    // 如果方向相同，不切换
    if (direction === this.currentGravityDirection) {
      return;
    }

    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;

    // 根据方向设置重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.set(0, -200);
        break;
      case 'down':
        this.physics.world.gravity.set(0, 200);
        break;
      case 'left':
        this.physics.world.gravity.set(-200, 0);
        break;
      case 'right':
        this.physics.world.gravity.set(200, 0);
        break;
    }

    // 记录日志
    console.log(JSON.stringify({
      event: 'gravity_switch',
      direction: direction,
      switchCount: this.gravitySwitchCount,
      timestamp: Date.now()
    }));
  }

  updateSignals() {
    // 统计在边界内的物体数量
    let inBoundsCount = 0;
    
    if (this.player.x >= 0 && this.player.x <= 800 && 
        this.player.y >= 0 && this.player.y <= 600) {
      inBoundsCount++;
    }

    this.objects.children.entries.forEach(obj => {
      if (obj.x >= 0 && obj.x <= 800 && 
          obj.y >= 0 && obj.y <= 600) {
        inBoundsCount++;
      }
    });

    window.__signals__ = {
      gravitySwitchCount: this.gravitySwitchCount,
      currentGravityDirection: this.currentGravityDirection,
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      playerVelocity: {
        x: Math.round(this.player.body.velocity.x),
        y: Math.round(this.player.body.velocity.y)
      },
      objectsInBounds: inBoundsCount,
      totalObjects: 13,
      worldGravity: {
        x: this.physics.world.gravity.x,
        y: this.physics.world.gravity.y
      },
      timestamp: Date.now()
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityGame
};

// 启动游戏
const game = new Phaser.Game(config);