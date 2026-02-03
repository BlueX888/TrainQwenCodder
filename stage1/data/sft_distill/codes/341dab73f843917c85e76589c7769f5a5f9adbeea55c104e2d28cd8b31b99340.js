class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理，无需外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      player1: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      player2: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      collisionCount: 0,
      timestamp: 0
    };

    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0000ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0000, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建玩家1（左侧）
    this.player1 = this.physics.add.sprite(200, 300, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧）
    this.player2 = this.physics.add.sprite(600, 300, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置玩家之间的碰撞
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);

    // 创建键盘控制
    // 玩家1: WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2: 方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置分屏摄像机
    // 移除默认摄像机
    this.cameras.main.setViewport(0, 0, 400, 600);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // 添加第二个摄像机
    this.camera2 = this.cameras.add(400, 0, 400, 600);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setBackgroundColor(0x2e1a1a);

    // 添加分隔线
    const divider = this.add.graphics();
    divider.lineStyle(2, 0xffffff, 1);
    divider.lineBetween(400, 0, 400, 600);
    divider.setScrollFactor(0);
    divider.setDepth(1000);

    // 添加UI文本
    this.text1 = this.add.text(10, 10, 'Player 1 (WASD)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text1.setScrollFactor(0);

    this.text2 = this.add.text(410, 10, 'Player 2 (Arrows)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text2.setScrollFactor(0);

    // 添加地面参考（可选）
    this.createWorldBounds();
  }

  createWorldBounds() {
    // 创建一些参考网格
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333333, 0.5);
    
    for (let x = 0; x <= 800; x += 100) {
      grid.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 100) {
      grid.lineBetween(0, y, 800, y);
    }
  }

  handleCollision(player1, player2) {
    this.collisionCount++;
    
    // 计算碰撞方向并施加弹开力
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = 200;
      const normalX = dx / distance;
      const normalY = dy / distance;
      
      // 玩家1向反方向弹开
      player1.setVelocity(
        player1.body.velocity.x - normalX * force,
        player1.body.velocity.y - normalY * force
      );
      
      // 玩家2向正方向弹开
      player2.setVelocity(
        player2.body.velocity.x + normalX * force,
        player2.body.velocity.y + normalY * force
      );
    }

    // 更新UI
    this.text1.setText(`Player 1 (WASD)\nCollisions: ${this.collisionCount}`);
    this.text2.setText(`Player 2 (Arrows)\nCollisions: ${this.collisionCount}`);

    // 记录碰撞事件
    console.log(JSON.stringify({
      event: 'collision',
      count: this.collisionCount,
      player1: { x: player1.x, y: player1.y },
      player2: { x: player2.x, y: player2.y },
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    const speed = 300;

    // 玩家1控制 (WASD)
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    } else {
      this.player1.setVelocityX(this.player1.body.velocity.x * 0.9);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    } else {
      this.player1.setVelocityY(this.player1.body.velocity.y * 0.9);
    }

    // 玩家2控制 (方向键)
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    } else {
      this.player2.setVelocityX(this.player2.body.velocity.x * 0.9);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    } else {
      this.player2.setVelocityY(this.player2.body.velocity.y * 0.9);
    }

    // 更新信号
    window.__signals__.player1 = {
      x: Math.round(this.player1.x),
      y: Math.round(this.player1.y),
      velocity: {
        x: Math.round(this.player1.body.velocity.x),
        y: Math.round(this.player1.body.velocity.y)
      }
    };

    window.__signals__.player2 = {
      x: Math.round(this.player2.x),
      y: Math.round(this.player2.y),
      velocity: {
        x: Math.round(this.player2.body.velocity.x),
        y: Math.round(this.player2.body.velocity.y)
      }
    };

    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.timestamp = time;
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

// 启动游戏
const game = new Phaser.Game(config);