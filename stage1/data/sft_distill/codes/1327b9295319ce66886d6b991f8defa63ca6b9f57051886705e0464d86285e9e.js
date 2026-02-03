class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.player1 = null;
    this.player2 = null;
    this.keys1 = null; // WASD
    this.keys2 = null; // Arrow keys
    this.camera1 = null;
    this.camera2 = null;
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
    graphics1.generateTexture('player1Tex', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2Tex', 32, 32);
    graphics2.destroy();

    // 创建背景网格以便区分区域
    this.createBackground(width, height);

    // 创建玩家1（左侧起始位置）
    this.player1 = this.physics.add.sprite(width * 0.25, height / 2, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.body.setMass(1);

    // 创建玩家2（右侧起始位置）
    this.player2 = this.physics.add.sprite(width * 0.75, height / 2, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5); // 设置弹性
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.body.setMass(1);

    // 添加玩家标签
    this.add.text(this.player1.x, this.player1.y - 30, 'P1', {
      fontSize: '16px',
      color: '#0088ff'
    }).setOrigin(0.5);

    this.add.text(this.player2.x, this.player2.y - 30, 'P2', {
      fontSize: '16px',
      color: '#ff0088'
    }).setOrigin(0.5);

    // 设置玩家碰撞
    this.physics.add.collider(this.player1, this.player2, this.onPlayersCollide, null, this);

    // 设置键盘控制
    // 玩家1使用WASD
    this.keys1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 玩家2使用方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 配置分屏摄像机
    this.setupSplitScreenCameras(width, height);

    // 添加控制说明
    this.createInstructions();

    // 初始化信号系统
    this.initSignals();
  }

  createBackground(width, height) {
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x333333, 0.5);
    const gridSize = 50;
    
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中线
    graphics.lineStyle(2, 0xffff00, 0.8);
    graphics.lineBetween(width / 2, 0, width / 2, height);
  }

  setupSplitScreenCameras(width, height) {
    // 获取默认摄像机
    this.camera1 = this.cameras.main;
    
    // 配置摄像机1（左半屏）
    this.camera1.setViewport(0, 0, width / 2, height);
    this.camera1.setBounds(0, 0, width, height);
    this.camera1.startFollow(this.player1, true, 0.1, 0.1);
    this.camera1.setZoom(1);

    // 创建摄像机2（右半屏）
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.setBounds(0, 0, width, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setZoom(1);

    // 添加摄像机边框
    const border1 = this.add.graphics();
    border1.lineStyle(4, 0x0088ff, 1);
    border1.strokeRect(2, 2, width / 2 - 4, height - 4);
    border1.setScrollFactor(0);
    border1.setDepth(1000);

    const border2 = this.add.graphics();
    border2.lineStyle(4, 0xff0088, 1);
    border2.strokeRect(width / 2 + 2, 2, width / 2 - 4, height - 4);
    border2.setScrollFactor(0);
    border2.setDepth(1000);
  }

  createInstructions() {
    const style = {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };

    // 玩家1说明（固定在左上角）
    this.add.text(10, 10, 'Player 1 (WASD)', style)
      .setScrollFactor(0)
      .setDepth(1001);

    // 玩家2说明（固定在右上角）
    const { width } = this.cameras.main;
    this.add.text(width / 2 + 10, 10, 'Player 2 (Arrows)', style)
      .setScrollFactor(0)
      .setDepth(1001);
  }

  onPlayersCollide(player1, player2) {
    this.collisionCount++;
    
    // 计算碰撞方向并施加推力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );

    const force = 200;
    player1.setVelocity(
      Math.cos(angle + Math.PI) * force,
      Math.sin(angle + Math.PI) * force
    );
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );

    // 更新信号
    this.updateSignals();
  }

  update(time, delta) {
    const speed = 360;

    // 玩家1控制（WASD）
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

    // 玩家2控制（方向键）
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

    // 定期更新信号
    if (time % 100 < delta) {
      this.updateSignals();
    }
  }

  initSignals() {
    window.__signals__ = {
      player1: {
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0
      },
      player2: {
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0
      },
      collisionCount: 0,
      distance: 0,
      timestamp: Date.now()
    };
  }

  updateSignals() {
    const distance = Phaser.Math.Distance.Between(
      this.player1.x, this.player1.y,
      this.player2.x, this.player2.y
    );

    window.__signals__ = {
      player1: {
        x: Math.round(this.player1.x * 100) / 100,
        y: Math.round(this.player1.y * 100) / 100,
        velocityX: Math.round(this.player1.body.velocity.x * 100) / 100,
        velocityY: Math.round(this.player1.body.velocity.y * 100) / 100
      },
      player2: {
        x: Math.round(this.player2.x * 100) / 100,
        y: Math.round(this.player2.y * 100) / 100,
        velocityX: Math.round(this.player2.body.velocity.x * 100) / 100,
        velocityY: Math.round(this.player2.body.velocity.y * 100) / 100
      },
      collisionCount: this.collisionCount,
      distance: Math.round(distance * 100) / 100,
      timestamp: Date.now()
    };

    // 输出日志便于验证
    if (this.collisionCount > 0 && this.collisionCount % 5 === 0) {
      console.log('[COLLISION_MILESTONE]', JSON.stringify(window.__signals__));
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: '#1a1a1a',
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

// 输出初始状态
console.log('[GAME_STARTED]', {
  config: {
    width: config.width,
    height: config.height,
    physics: config.physics.default
  },
  controls: {
    player1: 'WASD',
    player2: 'Arrow Keys'
  },
  speed: 360
});