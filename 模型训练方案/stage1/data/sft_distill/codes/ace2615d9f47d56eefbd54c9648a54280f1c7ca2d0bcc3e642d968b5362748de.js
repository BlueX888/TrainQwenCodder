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
    
    // 创建玩家纹理
    this.createPlayerTextures();
    
    // 创建游戏世界边界
    this.physics.world.setBounds(0, 0, width * 2, height);
    
    // 创建玩家1（蓝色，左侧出生）
    this.player1 = this.physics.add.sprite(width * 0.25, height / 2, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.name = 'Player1';
    
    // 创建玩家2（红色，右侧出生）
    this.player2 = this.physics.add.sprite(width * 1.75, height / 2, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.name = 'Player2';
    
    // 设置玩家碰撞
    this.physics.add.collider(this.player1, this.player2, this.onPlayerCollision, null, this);
    
    // 设置分屏摄像机
    this.setupCameras();
    
    // 设置键盘控制
    this.setupControls();
    
    // 添加UI文本
    this.createUI();
    
    // 初始化信号系统
    window.__signals__ = {
      collisionCount: 0,
      player1Position: { x: 0, y: 0 },
      player2Position: { x: 0, y: 0 },
      logs: []
    };
    
    // 记录初始状态
    this.recordSignal('game_start', {
      player1: { x: this.player1.x, y: this.player1.y },
      player2: { x: this.player2.x, y: this.player2.y }
    });
  }

  createPlayerTextures() {
    // 创建玩家1纹理（蓝色）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0066ff, 1);
    graphics1.fillCircle(25, 25, 25);
    graphics1.lineStyle(3, 0xffffff, 1);
    graphics1.strokeCircle(25, 25, 25);
    graphics1.generateTexture('player1Tex', 50, 50);
    graphics1.destroy();
    
    // 创建玩家2纹理（红色）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0066, 1);
    graphics2.fillCircle(25, 25, 25);
    graphics2.lineStyle(3, 0xffffff, 1);
    graphics2.strokeCircle(25, 25, 25);
    graphics2.generateTexture('player2Tex', 50, 50);
    graphics2.destroy();
  }

  setupCameras() {
    const { width, height } = this.cameras.main;
    
    // 主摄像机（左半屏 - 玩家1）
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.setBounds(0, 0, width * 2, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    
    // 添加第二个摄像机（右半屏 - 玩家2）
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.setBounds(0, 0, width * 2, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setBackgroundColor(0x2e1a1a);
    
    // 添加分割线
    const divider = this.add.graphics();
    divider.lineStyle(4, 0xffffff, 0.5);
    divider.lineBetween(width / 2, 0, width / 2, height);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  setupControls() {
    // 玩家1控制（WASD）
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };
    
    // 玩家2控制（方向键）
    this.keys2 = this.input.keyboard.createCursorKeys();
  }

  createUI() {
    const { width, height } = this.cameras.main;
    
    // 玩家1 UI（固定在左侧摄像机）
    this.text1 = this.add.text(10, 10, 'Player 1 (WASD)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#0066ff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.text1.setScrollFactor(0);
    this.text1.setDepth(1001);
    
    // 玩家2 UI（固定在右侧摄像机）
    this.text2 = this.add.text(width / 2 + 10, 10, 'Player 2 (Arrows)\nCollisions: 0', {
      fontSize: '16px',
      fill: '#ff0066',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.text2.setScrollFactor(0);
    this.text2.setDepth(1001);
  }

  onPlayerCollision(player1, player2) {
    this.collisionCount++;
    
    // 计算碰撞方向并施加弹开力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const force = 400;
    player1.setVelocity(
      Math.cos(angle + Math.PI) * force,
      Math.sin(angle + Math.PI) * force
    );
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );
    
    // 更新UI
    this.text1.setText(`Player 1 (WASD)\nCollisions: ${this.collisionCount}`);
    this.text2.setText(`Player 2 (Arrows)\nCollisions: ${this.collisionCount}`);
    
    // 记录碰撞信号
    this.recordSignal('collision', {
      count: this.collisionCount,
      player1: { x: player1.x, y: player1.y },
      player2: { x: player2.x, y: player2.y },
      angle: angle
    });
  }

  recordSignal(event, data) {
    const signal = {
      timestamp: this.time.now,
      event: event,
      data: data
    };
    
    this.signals.push(signal);
    window.__signals__.logs.push(signal);
    window.__signals__.collisionCount = this.collisionCount;
    
    console.log(`[SIGNAL] ${event}:`, JSON.stringify(data));
  }

  update(time, delta) {
    const speed = 360;
    
    // 玩家1移动（WASD）
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
    
    // 玩家2移动（方向键）
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
    
    // 每秒更新一次位置信号
    if (time % 1000 < delta) {
      window.__signals__.player1Position = {
        x: Math.round(this.player1.x),
        y: Math.round(this.player1.y)
      };
      window.__signals__.player2Position = {
        x: Math.round(this.player2.x),
        y: Math.round(this.player2.y)
      };
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1200,
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