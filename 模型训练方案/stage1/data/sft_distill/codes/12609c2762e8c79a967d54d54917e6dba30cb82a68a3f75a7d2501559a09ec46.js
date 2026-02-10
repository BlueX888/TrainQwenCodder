// 分屏多人游戏 - 两个玩家各占半屏
class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.collisionCount = 0;
    this.signals = {
      player1: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      player2: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      collisionCount: 0,
      frameCount: 0
    };
  }

  preload() {
    // 使用Graphics创建纯色纹理，无需外部资源
  }

  create() {
    const worldWidth = 1600;
    const worldHeight = 600;
    
    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 40, 40);
    graphics1.generateTexture('player1Tex', 40, 40);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillRect(0, 0, 40, 40);
    graphics2.generateTexture('player2Tex', 40, 40);
    graphics2.destroy();

    // 创建背景网格（便于观察移动）
    this.createGrid(worldWidth, worldHeight);

    // 创建玩家1（左侧起始位置）
    this.player1 = this.physics.add.sprite(400, 300, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧起始位置）
    this.player2 = this.physics.add.sprite(1200, 300, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 添加玩家名称标签
    this.add.text(this.player1.x, this.player1.y - 40, 'Player 1\n(WASD)', {
      fontSize: '14px',
      fill: '#0088ff',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(1);

    this.add.text(this.player2.x, this.player2.y - 40, 'Player 2\n(Arrows)', {
      fontSize: '14px',
      fill: '#ff0088',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(1);

    // 设置玩家碰撞 - 碰撞时双方弹开
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);

    // 创建键盘输入
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
    this.setupSplitScreenCameras(worldWidth, worldHeight);

    // 创建UI显示碰撞计数
    this.createUI();

    // 暴露验证信号
    window.__signals__ = this.signals;
    
    console.log('[Game Start] Split-screen multiplayer initialized');
  }

  createGrid(width, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 100) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 100) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  setupSplitScreenCameras(worldWidth, worldHeight) {
    // 移除默认摄像机
    this.cameras.main.setVisible(false);

    // 创建左侧摄像机（玩家1）
    this.camera1 = this.cameras.add(0, 0, 400, 600);
    this.camera1.setBounds(0, 0, worldWidth, worldHeight);
    this.camera1.startFollow(this.player1, true, 0.1, 0.1);
    this.camera1.setBackgroundColor(0x001122);

    // 创建右侧摄像机（玩家2）
    this.camera2 = this.cameras.add(400, 0, 400, 600);
    this.camera2.setBounds(0, 0, worldWidth, worldHeight);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setBackgroundColor(0x220011);

    // 添加分屏分隔线
    const divider = this.add.graphics();
    divider.fillStyle(0xffffff, 1);
    divider.fillRect(398, 0, 4, 600);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  createUI() {
    // 玩家1 UI（左上角）
    this.ui1Text = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.ui1Text.setScrollFactor(0);
    this.ui1Text.setDepth(999);
    this.camera1.ignore(this.ui1Text);

    // 玩家2 UI（右上角）
    this.ui2Text = this.add.text(410, 10, '', {
      fontSize: '16px',
      fill: '#ff0088',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.ui2Text.setScrollFactor(0);
    this.ui2Text.setDepth(999);
    this.camera2.ignore(this.ui2Text);

    // 碰撞计数UI（中央）
    this.collisionText = this.add.text(400, 10, 'Collisions: 0', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1001);
  }

  handleCollision(player1, player2) {
    // 碰撞时增加弹开效果
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const pushForce = 300;
    player1.setVelocity(
      Math.cos(angle + Math.PI) * pushForce,
      Math.sin(angle + Math.PI) * pushForce
    );
    player2.setVelocity(
      Math.cos(angle) * pushForce,
      Math.sin(angle) * pushForce
    );

    this.collisionCount++;
    this.signals.collisionCount = this.collisionCount;
    
    console.log(`[Collision] Count: ${this.collisionCount}, P1: (${Math.round(player1.x)}, ${Math.round(player1.y)}), P2: (${Math.round(player2.x)}, ${Math.round(player2.y)})`);
  }

  update(time, delta) {
    this.signals.frameCount++;

    // 玩家1控制 (WASD)
    const speed1 = 200;
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed1);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed1);
    } else {
      this.player1.setVelocityX(this.player1.body.velocity.x * 0.9);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed1);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed1);
    } else {
      this.player1.setVelocityY(this.player1.body.velocity.y * 0.9);
    }

    // 玩家2控制 (方向键)
    const speed2 = 200;
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed2);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed2);
    } else {
      this.player2.setVelocityX(this.player2.body.velocity.x * 0.9);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed2);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed2);
    } else {
      this.player2.setVelocityY(this.player2.body.velocity.y * 0.9);
    }

    // 更新UI
    this.ui1Text.setText(`Player 1\nPos: (${Math.round(this.player1.x)}, ${Math.round(this.player1.y)})\nVel: (${Math.round(this.player1.body.velocity.x)}, ${Math.round(this.player1.body.velocity.y)})`);
    
    this.ui2Text.setText(`Player 2\nPos: (${Math.round(this.player2.x)}, ${Math.round(this.player2.y)})\nVel: (${Math.round(this.player2.body.velocity.x)}, ${Math.round(this.player2.body.velocity.y)})`);
    
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 更新验证信号
    this.signals.player1 = {
      x: Math.round(this.player1.x),
      y: Math.round(this.player1.y),
      velocity: {
        x: Math.round(this.player1.body.velocity.x),
        y: Math.round(this.player1.body.velocity.y)
      }
    };
    this.signals.player2 = {
      x: Math.round(this.player2.x),
      y: Math.round(this.player2.y),
      velocity: {
        x: Math.round(this.player2.body.velocity.x),
        y: Math.round(this.player2.body.velocity.y)
      }
    };
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

// 输出初始化信息
console.log('[Game Config] Split-screen multiplayer game initialized');
console.log('[Controls] Player 1: WASD | Player 2: Arrow Keys');
console.log('[Signals] Access game state via window.__signals__');