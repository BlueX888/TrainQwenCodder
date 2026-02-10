class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player1 = null;
    this.player2 = null;
    this.keys1 = null;
    this.keys2 = null;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const worldWidth = 1600;
    const worldHeight = 600;

    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建玩家1纹理（蓝色）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillCircle(16, 16, 16);
    graphics1.generateTexture('player1Tex', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillCircle(16, 16, 16);
    graphics2.generateTexture('player2Tex', 32, 32);
    graphics2.destroy();

    // 创建玩家1（左侧起始位置）
    this.player1 = this.physics.add.sprite(400, 300, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧起始位置）
    this.player2 = this.physics.add.sprite(1200, 300, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置玩家之间的碰撞
    this.physics.add.collider(this.player1, this.player2, this.onPlayerCollision, null, this);

    // 配置分屏相机
    const camera1 = this.cameras.main;
    camera1.setBounds(0, 0, worldWidth, worldHeight);
    camera1.setViewport(0, 0, 400, 600);
    camera1.startFollow(this.player1, true, 0.1, 0.1);
    camera1.setZoom(1);

    const camera2 = this.cameras.add(400, 0, 400, 600);
    camera2.setBounds(0, 0, worldWidth, worldHeight);
    camera2.startFollow(this.player2, true, 0.1, 0.1);
    camera2.setZoom(1);

    // 添加分隔线（用于视觉区分）
    const divider = this.add.graphics();
    divider.lineStyle(2, 0xffffff, 1);
    divider.lineBetween(800, 0, 800, worldHeight);
    divider.setScrollFactor(0);
    divider.setDepth(1000);

    // 键盘输入设置
    // 玩家1: WASD
    this.keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 玩家2: 方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 添加文本提示（固定在相机上）
    const text1 = this.add.text(10, 10, 'Player 1 (WASD)', {
      fontSize: '16px',
      color: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    text1.setScrollFactor(0);
    text1.setCameraFilter(1); // 只在相机1显示

    const text2 = this.add.text(410, 10, 'Player 2 (Arrows)', {
      fontSize: '16px',
      color: '#ff0088',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    text2.setScrollFactor(0);
    text2.setCameraFilter(2); // 只在相机2显示

    // 初始化状态信号
    window.__signals__ = {
      player1: { x: this.player1.x, y: this.player1.y, vx: 0, vy: 0 },
      player2: { x: this.player2.x, y: this.player2.y, vx: 0, vy: 0 },
      collisionCount: 0,
      frameCount: 0
    };

    console.log('[INIT] Game scene created with split-screen cameras');
  }

  onPlayerCollision(player1, player2) {
    this.collisionCount++;
    
    // 计算碰撞方向并施加弹开力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const force = 300;
    player1.setVelocity(
      -Math.cos(angle) * force,
      -Math.sin(angle) * force
    );
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );

    console.log(`[COLLISION] Count: ${this.collisionCount}, Angle: ${angle.toFixed(2)}`);
  }

  update(time, delta) {
    const speed = 200;

    // 玩家1移动控制
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

    // 玩家2移动控制
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

    // 更新状态信号
    if (window.__signals__) {
      window.__signals__.player1 = {
        x: Math.round(this.player1.x),
        y: Math.round(this.player1.y),
        vx: Math.round(this.player1.body.velocity.x),
        vy: Math.round(this.player1.body.velocity.y)
      };
      window.__signals__.player2 = {
        x: Math.round(this.player2.x),
        y: Math.round(this.player2.y),
        vx: Math.round(this.player2.body.velocity.x),
        vy: Math.round(this.player2.body.velocity.y)
      };
      window.__signals__.collisionCount = this.collisionCount;
      window.__signals__.frameCount++;

      // 每60帧输出一次状态
      if (window.__signals__.frameCount % 60 === 0) {
        console.log('[STATE]', JSON.stringify(window.__signals__));
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