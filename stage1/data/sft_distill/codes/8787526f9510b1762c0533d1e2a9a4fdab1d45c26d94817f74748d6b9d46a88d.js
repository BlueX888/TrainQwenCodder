class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0;
    this.signals = [];
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
    
    // 创建背景区分
    const bg1 = this.add.graphics();
    bg1.fillStyle(0x222222, 1);
    bg1.fillRect(0, 0, width / 2, height);
    
    const bg2 = this.add.graphics();
    bg2.fillStyle(0x333333, 1);
    bg2.fillRect(width / 2, 0, width / 2, height);
    
    // 创建分界线
    const divider = this.add.graphics();
    divider.lineStyle(2, 0xffffff, 1);
    divider.lineBetween(width / 2, 0, width / 2, height);
    
    // 创建玩家1（左侧）
    this.player1 = this.physics.add.sprite(width / 4, height / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.setMaxVelocity(160, 160);
    
    // 创建玩家2（右侧）
    this.player2 = this.physics.add.sprite(width * 3 / 4, height / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.setMaxVelocity(160, 160);
    
    // 设置摄像机1（左半屏）
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.setBounds(0, 0, width, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    
    // 创建摄像机2（右半屏）
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.setBounds(0, 0, width, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    
    // 玩家1控制键（WASD）
    this.keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 玩家2控制键（方向键）
    this.keys2 = this.input.keyboard.createCursorKeys();
    
    // 设置玩家间碰撞
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);
    
    // 添加UI文本（显示在世界坐标，两个摄像机都能看到）
    this.collisionText = this.add.text(width / 2, 20, 'Collisions: 0', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setOrigin(0.5, 0);
    this.collisionText.setScrollFactor(0);
    
    // 玩家1提示
    const hint1 = this.add.text(20, height - 40, 'Player 1: WASD', {
      fontSize: '16px',
      fill: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    hint1.setScrollFactor(0);
    
    // 玩家2提示
    const hint2 = this.add.text(width - 20, height - 40, 'Player 2: Arrows', {
      fontSize: '16px',
      fill: '#ff0088',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    hint2.setOrigin(1, 0);
    hint2.setScrollFactor(0);
    
    // 初始化信号输出
    window.__signals__ = {
      collisionCount: 0,
      player1: { x: this.player1.x, y: this.player1.y },
      player2: { x: this.player2.x, y: this.player2.y },
      history: []
    };
  }

  handleCollision(player1, player2) {
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
    
    // 计算碰撞方向并施加弹开力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const bounceForce = 200;
    
    // 玩家1向反方向弹开
    player1.setVelocity(
      -Math.cos(angle) * bounceForce,
      -Math.sin(angle) * bounceForce
    );
    
    // 玩家2向正方向弹开
    player2.setVelocity(
      Math.cos(angle) * bounceForce,
      Math.sin(angle) * bounceForce
    );
    
    // 记录碰撞信号
    const signal = {
      type: 'collision',
      time: this.time.now,
      count: this.collisionCount,
      player1Pos: { x: Math.round(player1.x), y: Math.round(player1.y) },
      player2Pos: { x: Math.round(player2.x), y: Math.round(player2.y) }
    };
    
    this.signals.push(signal);
    window.__signals__.history.push(signal);
    
    console.log('[COLLISION]', JSON.stringify(signal));
  }

  update(time, delta) {
    const speed = 160;
    
    // 玩家1移动控制
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    }
    
    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    }
    
    // 玩家2移动控制
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    }
    
    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    }
    
    // 每秒更新一次全局信号
    if (time % 1000 < delta) {
      window.__signals__.collisionCount = this.collisionCount;
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
    }
  }
}

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

const game = new Phaser.Game(config);