class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.sys.game.config;

    // 创建玩家纹理
    this.createPlayerTextures();

    // 创建物理世界边界
    this.physics.world.setBounds(0, 0, width, height);

    // 创建玩家1（蓝色，左侧）
    this.player1 = this.physics.add.sprite(200, height / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.8); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（红色，右侧）
    this.player2 = this.physics.add.sprite(width - 200, height / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.8);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置碰撞检测
    this.physics.add.collider(this.player1, this.player2, this.onCollision, null, this);

    // 创建键盘输入
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    // 设置摄像机
    this.setupCameras();

    // 添加分割线
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.lineBetween(width / 2, 0, width / 2, height);

    // 添加玩家标签
    this.add.text(100, 30, 'Player 1 (WASD)', {
      fontSize: '20px',
      color: '#00ffff'
    }).setScrollFactor(0);

    this.add.text(width / 2 + 100, 30, 'Player 2 (Arrows)', {
      fontSize: '20px',
      color: '#ff00ff'
    }).setScrollFactor(0);

    // 初始化验证信号
    window.__signals__ = {
      player1: { x: this.player1.x, y: this.player1.y, vx: 0, vy: 0 },
      player2: { x: this.player2.x, y: this.player2.y, vx: 0, vy: 0 },
      collisionCount: 0,
      frameCount: 0
    };
  }

  createPlayerTextures() {
    // 创建玩家1纹理（蓝色圆形）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillCircle(16, 16, 16);
    graphics1.lineStyle(2, 0x00ffff, 1);
    graphics1.strokeCircle(16, 16, 16);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色圆形）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillCircle(16, 16, 16);
    graphics2.lineStyle(2, 0xff00ff, 1);
    graphics2.strokeCircle(16, 16, 16);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();
  }

  setupCameras() {
    const { width, height } = this.sys.game.config;

    // 主摄像机（左半屏，跟随玩家1）
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    // 添加第二个摄像机（右半屏，跟随玩家2）
    const camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    camera2.startFollow(this.player2, true, 0.1, 0.1);
    camera2.setZoom(1);
  }

  onCollision(player1, player2) {
    this.collisionCount++;
    window.__signals__.collisionCount = this.collisionCount;
    
    // 计算碰撞方向并施加额外的弹开力
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = 200;
      const nx = dx / distance;
      const ny = dy / distance;
      
      player1.setVelocity(player1.body.velocity.x - nx * force, player1.body.velocity.y - ny * force);
      player2.setVelocity(player2.body.velocity.x + nx * force, player2.body.velocity.y + ny * force);
    }

    console.log(`Collision #${this.collisionCount} at frame ${window.__signals__.frameCount}`);
  }

  update(time, delta) {
    const speed = 360;

    // 玩家1控制（WASD）
    this.player1.setVelocity(0);
    
    if (this.wasd.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.wasd.right.isDown) {
      this.player1.setVelocityX(speed);
    }

    if (this.wasd.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.wasd.down.isDown) {
      this.player1.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
    if (this.player1.body.velocity.x !== 0 && this.player1.body.velocity.y !== 0) {
      const angle = Math.atan2(this.player1.body.velocity.y, this.player1.body.velocity.x);
      this.player1.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    // 玩家2控制（方向键）
    this.player2.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player2.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player2.setVelocityY(speed);
    }

    // 对角线移动时归一化速度
    if (this.player2.body.velocity.x !== 0 && this.player2.body.velocity.y !== 0) {
      const angle = Math.atan2(this.player2.body.velocity.y, this.player2.body.velocity.x);
      this.player2.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    }

    // 更新验证信号
    window.__signals__.player1 = {
      x: Math.round(this.player1.x * 100) / 100,
      y: Math.round(this.player1.y * 100) / 100,
      vx: Math.round(this.player1.body.velocity.x * 100) / 100,
      vy: Math.round(this.player1.body.velocity.y * 100) / 100
    };

    window.__signals__.player2 = {
      x: Math.round(this.player2.x * 100) / 100,
      y: Math.round(this.player2.y * 100) / 100,
      vx: Math.round(this.player2.body.velocity.x * 100) / 100,
      vy: Math.round(this.player2.body.velocity.y * 100) / 100
    };

    window.__signals__.frameCount++;

    // 每60帧输出一次状态
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify(window.__signals__));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

new Phaser.Game(config);