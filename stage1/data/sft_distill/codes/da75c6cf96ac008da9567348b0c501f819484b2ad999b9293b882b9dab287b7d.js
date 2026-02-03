class SplitScreenGame extends Phaser.Scene {
  constructor() {
    super('SplitScreenGame');
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建背景分隔线
    const divider = this.add.graphics();
    divider.lineStyle(2, 0xffffff, 1);
    divider.lineBetween(width / 2, 0, width / 2, height);

    // 创建玩家1（左侧）
    this.player1 = this.physics.add.sprite(width / 4, height / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧）
    this.player2 = this.physics.add.sprite(width * 3 / 4, height / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置碰撞检测
    this.physics.add.collider(this.player1, this.player2, this.onCollision, null, this);

    // 设置摄像机1（左半屏）
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);

    // 添加摄像机2（右半屏）
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.setBounds(0, 0, width, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);

    // 设置键盘控制
    // 玩家1: WASD
    this.keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 玩家2: 方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 添加文本显示（每个摄像机各一个）
    this.text1 = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text1.setScrollFactor(0);

    this.text2 = this.add.text(width / 2 + 10, 10, '', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text2.setScrollFactor(0);
    this.text2.setCameraFilter(this.camera2);

    // 初始化信号对象
    window.__signals__ = {
      collisionCount: 0,
      player1: { x: 0, y: 0, vx: 0, vy: 0 },
      player2: { x: 0, y: 0, vx: 0, vy: 0 },
      timestamp: Date.now()
    };

    console.log('[GAME_START]', JSON.stringify({
      scene: 'SplitScreenGame',
      players: 2,
      speed: 160,
      worldSize: { width, height }
    }));
  }

  onCollision(player1, player2) {
    this.collisionCount++;
    
    // 计算碰撞方向并施加反向力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const force = 200;
    player1.setVelocity(
      -Math.cos(angle) * force,
      -Math.sin(angle) * force
    );
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );

    console.log('[COLLISION]', JSON.stringify({
      count: this.collisionCount,
      player1: { x: player1.x, y: player1.y },
      player2: { x: player2.x, y: player2.y },
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    const speed = 160;

    // 玩家1控制 (WASD)
    let vx1 = 0;
    let vy1 = 0;
    
    if (this.keys1.left.isDown) vx1 = -speed;
    else if (this.keys1.right.isDown) vx1 = speed;
    
    if (this.keys1.up.isDown) vy1 = -speed;
    else if (this.keys1.down.isDown) vy1 = speed;

    if (vx1 !== 0 || vy1 !== 0) {
      this.player1.setVelocity(vx1, vy1);
    }

    // 玩家2控制 (方向键)
    let vx2 = 0;
    let vy2 = 0;
    
    if (this.keys2.left.isDown) vx2 = -speed;
    else if (this.keys2.right.isDown) vx2 = speed;
    
    if (this.keys2.up.isDown) vy2 = -speed;
    else if (this.keys2.down.isDown) vy2 = speed;

    if (vx2 !== 0 || vy2 !== 0) {
      this.player2.setVelocity(vx2, vy2);
    }

    // 更新显示文本
    this.text1.setText([
      'Player 1 (WASD)',
      `Pos: (${Math.round(this.player1.x)}, ${Math.round(this.player1.y)})`,
      `Vel: (${Math.round(this.player1.body.velocity.x)}, ${Math.round(this.player1.body.velocity.y)})`,
      `Collisions: ${this.collisionCount}`
    ]);

    this.text2.setText([
      'Player 2 (Arrows)',
      `Pos: (${Math.round(this.player2.x)}, ${Math.round(this.player2.y)})`,
      `Vel: (${Math.round(this.player2.body.velocity.x)}, ${Math.round(this.player2.body.velocity.y)})`,
      `Collisions: ${this.collisionCount}`
    ]);

    // 更新信号
    window.__signals__ = {
      collisionCount: this.collisionCount,
      player1: {
        x: Math.round(this.player1.x),
        y: Math.round(this.player1.y),
        vx: Math.round(this.player1.body.velocity.x),
        vy: Math.round(this.player1.body.velocity.y)
      },
      player2: {
        x: Math.round(this.player2.x),
        y: Math.round(this.player2.y),
        vx: Math.round(this.player2.body.velocity.x),
        vy: Math.round(this.player2.body.velocity.y)
      },
      timestamp: Date.now()
    };
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
  scene: SplitScreenGame
};

const game = new Phaser.Game(config);