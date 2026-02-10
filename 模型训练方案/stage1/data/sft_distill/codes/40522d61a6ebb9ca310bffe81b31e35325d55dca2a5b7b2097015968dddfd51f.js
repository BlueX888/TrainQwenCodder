// 分屏多人游戏 - 两个玩家各占半屏
class SplitScreenGame extends Phaser.Scene {
  constructor() {
    super('SplitScreenGame');
    this.collisionCount = 0;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      player1: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      player2: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      collisionCount: 0,
      frame: 0
    };

    // 创建世界边界
    this.physics.world.setBounds(0, 0, 1600, 600);

    // 生成玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 40, 40);
    graphics1.generateTexture('player1Tex', 40, 40);
    graphics1.destroy();

    // 生成玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0044, 1);
    graphics2.fillRect(0, 0, 40, 40);
    graphics2.generateTexture('player2Tex', 40, 40);
    graphics2.destroy();

    // 创建玩家1（左侧区域）
    this.player1 = this.physics.add.sprite(400, 300, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧区域）
    this.player2 = this.physics.add.sprite(1200, 300, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5); // 设置弹性
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置玩家之间的碰撞，带弹开效果
    this.physics.add.collider(this.player1, this.player2, () => {
      this.collisionCount++;
      window.__signals__.collisionCount = this.collisionCount;
      
      // 记录碰撞日志
      console.log(JSON.stringify({
        event: 'collision',
        count: this.collisionCount,
        frame: window.__signals__.frame,
        player1Pos: { x: Math.round(this.player1.x), y: Math.round(this.player1.y) },
        player2Pos: { x: Math.round(this.player2.x), y: Math.round(this.player2.y) }
      }));
    });

    // 创建摄像机1（左半屏）
    const camera1 = this.cameras.main;
    camera1.setViewport(0, 0, 400, 600);
    camera1.setBounds(0, 0, 1600, 600);
    camera1.startFollow(this.player1, true, 0.1, 0.1);
    camera1.setBackgroundColor(0x1a1a2e);

    // 创建摄像机2（右半屏）
    const camera2 = this.cameras.add(400, 0, 400, 600);
    camera2.setBounds(0, 0, 1600, 600);
    camera2.startFollow(this.player2, true, 0.1, 0.1);
    camera2.setBackgroundColor(0x2e1a1a);

    // 添加分隔线（两个摄像机都能看到）
    const dividerGraphics = this.add.graphics();
    dividerGraphics.lineStyle(4, 0xffffff, 1);
    dividerGraphics.lineBetween(800, 0, 800, 600);
    dividerGraphics.setScrollFactor(0); // 固定在屏幕上

    // 玩家1控制键（WASD）
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2控制键（方向键）
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 添加文本标签（显示在各自摄像机中）
    this.label1 = this.add.text(10, 10, 'P1 (WASD)', {
      fontSize: '16px',
      color: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.label1.setScrollFactor(0);
    this.label1.setCameraFilter(camera1.id);

    this.label2 = this.add.text(410, 10, 'P2 (Arrows)', {
      fontSize: '16px',
      color: '#ff0044',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.label2.setScrollFactor(0);
    this.label2.setCameraFilter(camera2.id);

    // 碰撞计数显示
    this.collisionText = this.add.text(10, 570, 'Collisions: 0', {
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
  }

  update(time, delta) {
    window.__signals__.frame++;

    // 玩家1移动控制
    const speed1 = 300;
    this.player1.setVelocity(0);

    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed1);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed1);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed1);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed1);
    }

    // 玩家2移动控制
    const speed2 = 300;
    this.player2.setVelocity(0);

    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed2);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed2);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed2);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed2);
    }

    // 更新信号数据
    window.__signals__.player1 = {
      x: Math.round(this.player1.x * 100) / 100,
      y: Math.round(this.player1.y * 100) / 100,
      velocity: {
        x: Math.round(this.player1.body.velocity.x * 100) / 100,
        y: Math.round(this.player1.body.velocity.y * 100) / 100
      }
    };

    window.__signals__.player2 = {
      x: Math.round(this.player2.x * 100) / 100,
      y: Math.round(this.player2.y * 100) / 100,
      velocity: {
        x: Math.round(this.player2.body.velocity.x * 100) / 100,
        y: Math.round(this.player2.body.velocity.y * 100) / 100
      }
    };

    // 更新碰撞计数显示
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 每60帧输出一次状态日志
    if (window.__signals__.frame % 60 === 0) {
      console.log(JSON.stringify({
        event: 'status',
        frame: window.__signals__.frame,
        player1: window.__signals__.player1,
        player2: window.__signals__.player2,
        collisionCount: this.collisionCount
      }));
    }
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
  scene: SplitScreenGame
};

// 启动游戏
new Phaser.Game(config);