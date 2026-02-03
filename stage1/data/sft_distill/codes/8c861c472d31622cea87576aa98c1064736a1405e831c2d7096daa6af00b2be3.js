// 分屏多人游戏 - 双玩家对战
class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0;
    this.player1Score = 0;
    this.player2Score = 0;
  }

  preload() {
    // 使用 Graphics 创建玩家纹理，无需外部资源
    this.createPlayerTextures();
  }

  createPlayerTextures() {
    // 创建玩家1纹理（蓝色）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillCircle(16, 16, 16);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillCircle(16, 16, 16);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建背景网格纹理
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    for (let i = 0; i <= 800; i += 50) {
      gridGraphics.lineBetween(i, 0, i, 600);
    }
    for (let j = 0; j <= 600; j += 50) {
      gridGraphics.lineBetween(0, j, 800, j);
    }
    gridGraphics.generateTexture('grid', 800, 600);
    gridGraphics.destroy();
  }

  create() {
    // 添加背景网格
    this.add.image(400, 300, 'grid');

    // 创建玩家1（左侧出生）
    this.player1 = this.physics.add.sprite(200, 300, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.9);

    // 创建玩家2（右侧出生）
    this.player2 = this.physics.add.sprite(600, 300, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3); // 设置弹性
    this.player2.setDamping(true);
    this.player2.setDrag(0.9);

    // 设置玩家间碰撞，碰撞时双方弹开
    this.physics.add.collider(this.player1, this.player2, this.onPlayersCollide, null, this);

    // 设置键盘输入
    // 玩家1：WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2：方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置分屏摄像机
    this.setupCameras();

    // 添加UI文本显示
    this.setupUI();

    // 初始化信号记录
    this.initSignals();
  }

  setupCameras() {
    // 主摄像机（默认）跟随玩家1，占据左半屏
    const cam1 = this.cameras.main;
    cam1.setViewport(0, 0, 400, 600);
    cam1.startFollow(this.player1, true, 0.1, 0.1);
    cam1.setZoom(1);
    cam1.setBounds(0, 0, 800, 600);

    // 添加第二个摄像机跟随玩家2，占据右半屏
    const cam2 = this.cameras.add(400, 0, 400, 600);
    cam2.startFollow(this.player2, true, 0.1, 0.1);
    cam2.setZoom(1);
    cam2.setBounds(0, 0, 800, 600);

    // 添加分隔线
    const divider = this.add.graphics();
    divider.lineStyle(3, 0xffffff, 1);
    divider.lineBetween(400, 0, 400, 600);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  setupUI() {
    // 玩家1的UI（固定在左半屏）
    this.text1 = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text1.setScrollFactor(0);
    this.text1.setDepth(1001);

    // 玩家2的UI（固定在右半屏）
    this.text2 = this.add.text(410, 10, '', {
      fontSize: '16px',
      fill: '#ff0088',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text2.setScrollFactor(0);
    this.text2.setDepth(1001);

    // 碰撞计数器（居中）
    this.collisionText = this.add.text(400, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setOrigin(0.5, 0);
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1001);
  }

  onPlayersCollide(player1, player2) {
    // 碰撞时增加计数
    this.collisionCount++;

    // 计算碰撞方向，增强弹开效果
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const force = 200;
      const nx = dx / distance;
      const ny = dy / distance;
      
      // 给两个玩家施加相反方向的力
      player1.setVelocity(-nx * force, -ny * force);
      player2.setVelocity(nx * force, ny * force);
    }

    // 记录碰撞信号
    this.recordCollision();
  }

  update(time, delta) {
    const speed = 300;

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

    // 更新UI
    this.updateUI();

    // 更新信号
    this.updateSignals();
  }

  updateUI() {
    this.text1.setText([
      'Player 1 (WASD)',
      `Pos: (${Math.round(this.player1.x)}, ${Math.round(this.player1.y)})`,
      `Vel: (${Math.round(this.player1.body.velocity.x)}, ${Math.round(this.player1.body.velocity.y)})`
    ]);

    this.text2.setText([
      'Player 2 (Arrows)',
      `Pos: (${Math.round(this.player2.x)}, ${Math.round(this.player2.y)})`,
      `Vel: (${Math.round(this.player2.body.velocity.x)}, ${Math.round(this.player2.body.velocity.y)})`
    ]);

    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  initSignals() {
    window.__signals__ = {
      collisionCount: 0,
      player1: { x: 0, y: 0, vx: 0, vy: 0 },
      player2: { x: 0, y: 0, vx: 0, vy: 0 },
      collisionHistory: [],
      frameCount: 0
    };
  }

  updateSignals() {
    window.__signals__.frameCount++;
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

  recordCollision() {
    const collisionData = {
      time: Date.now(),
      count: this.collisionCount,
      player1Pos: { x: Math.round(this.player1.x), y: Math.round(this.player1.y) },
      player2Pos: { x: Math.round(this.player2.x), y: Math.round(this.player2.y) }
    };
    window.__signals__.collisionHistory.push(collisionData);
    console.log('Collision detected:', JSON.stringify(collisionData));
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#111111',
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
console.log('Split-screen multiplayer game initialized');
console.log('Player 1 controls: WASD');
console.log('Player 2 controls: Arrow Keys');
console.log('Speed: 300 pixels/second');
console.log('Collision system: Active with bounce effect');