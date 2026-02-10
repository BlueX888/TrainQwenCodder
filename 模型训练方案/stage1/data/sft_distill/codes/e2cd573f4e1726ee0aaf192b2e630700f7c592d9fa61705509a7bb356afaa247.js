class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformsPassed = 0;
    this.deaths = 0;
    this.isGameOver = false;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // 创建平台组
    this.platforms = this.physics.add.group();

    // 创建10个移动平台，形成路径
    const platformConfigs = [
      { x: 200, y: 450, direction: 'horizontal', range: 100 },
      { x: 350, y: 380, direction: 'vertical', range: 80 },
      { x: 480, y: 320, direction: 'horizontal', range: 120 },
      { x: 620, y: 260, direction: 'vertical', range: 60 },
      { x: 700, y: 200, direction: 'horizontal', range: 100 },
      { x: 650, y: 140, direction: 'vertical', range: 70 },
      { x: 500, y: 100, direction: 'horizontal', range: 150 },
      { x: 320, y: 150, direction: 'vertical', range: 80 },
      { x: 180, y: 220, direction: 'horizontal', range: 100 },
      { x: 100, y: 300, direction: 'vertical', range: 90 }
    ];

    this.platformData = [];

    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.setImmovable(true);
      platform.body.allowGravity = false;
      
      // 存储平台运动数据
      this.platformData.push({
        sprite: platform,
        startX: config.x,
        startY: config.y,
        direction: config.direction,
        range: config.range,
        speed: 200,
        time: 0,
        passed: false,
        index: index
      });
    });

    // 碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.hintText = this.add.text(400, 50, 'Use Arrow Keys to move, SPACE to jump\nReach all 10 platforms!', {
      fontSize: '16px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新平台位置
    this.platformData.forEach(data => {
      data.time += delta / 1000;
      
      if (data.direction === 'horizontal') {
        const offset = Math.sin(data.time * data.speed / 100) * data.range;
        data.sprite.x = data.startX + offset;
      } else {
        const offset = Math.sin(data.time * data.speed / 100) * data.range;
        data.sprite.y = data.startY + offset;
      }

      // 检测玩家是否站在平台上并标记为已通过
      if (!data.passed && this.player.body.touching.down && 
          this.physics.overlap(this.player, data.sprite)) {
        data.passed = true;
        this.platformsPassed++;
        this.updateStatusText();
        
        // 平台变色表示已通过
        data.sprite.setTint(0x00ff00);
        
        // 检查是否通过所有平台
        if (this.platformsPassed >= 10) {
          this.gameWin();
        }
      }
    });

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
    }

    // 检测掉落
    if (this.player.y > 600) {
      this.playerDeath();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Platforms Passed: ${this.platformsPassed}/10\n` +
      `Deaths: ${this.deaths}\n` +
      `Player Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
  }

  playerDeath() {
    this.deaths++;
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
    this.updateStatusText();

    // 闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 3
    });
  }

  gameWin() {
    this.isGameOver = true;
    
    const winText = this.add.text(400, 300, 
      `YOU WIN!\nPassed all 10 platforms!\nDeaths: ${this.deaths}`, {
      fontSize: '32px',
      fill: '#00ff00',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 停止所有平台移动
    this.platformData.forEach(data => {
      data.speed = 0;
    });

    // 庆祝动画
    this.tweens.add({
      targets: winText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
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
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);