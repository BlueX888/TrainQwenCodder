class PlatformGameScene extends Phaser.Scene {
  constructor() {
    super('PlatformGameScene');
    this.platformsPassed = 0;
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
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

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建10个平台，形成路径
    this.platformData = [];
    const platformConfigs = [
      { x: 100, y: 500, direction: 1, rangeX: [50, 250] },
      { x: 250, y: 450, direction: -1, rangeX: [200, 400] },
      { x: 400, y: 400, direction: 1, rangeX: [350, 550] },
      { x: 550, y: 350, direction: -1, rangeX: [500, 700] },
      { x: 650, y: 300, direction: 1, rangeX: [600, 750] },
      { x: 700, y: 250, direction: -1, rangeX: [550, 750] },
      { x: 600, y: 200, direction: 1, rangeX: [450, 700] },
      { x: 450, y: 150, direction: -1, rangeX: [300, 550] },
      { x: 300, y: 100, direction: 1, rangeX: [200, 450] },
      { x: 150, y: 50, direction: -1, rangeX: [100, 300] }
    ];

    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setVelocityX(config.direction * 80);
      
      this.platformData.push({
        sprite: platform,
        direction: config.direction,
        rangeX: config.rangeX,
        index: index,
        passed: false
      });
    });

    // 添加起始地面平台
    const ground = this.platforms.create(100, 550, 'platform');
    ground.setScale(2, 1);
    ground.body.setVelocityX(0);

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // UI文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏结束检测区域
    this.deathZone = 600;

    // 计时器
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.survivalTime += 0.1;
        }
      },
      loop: true
    });

    this.updateStatusText();
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（空格键或上箭头）
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
         Phaser.Input.Keyboard.JustDown(this.cursors.up)) && 
        this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新平台移动
    this.platformData.forEach(data => {
      const platform = data.sprite;
      
      // 边界反弹
      if (platform.x <= data.rangeX[0] && data.direction === -1) {
        data.direction = 1;
        platform.body.setVelocityX(80);
      } else if (platform.x >= data.rangeX[1] && data.direction === 1) {
        data.direction = -1;
        platform.body.setVelocityX(-80);
      }

      // 检测玩家是否通过平台（向上穿过）
      if (!data.passed && this.player.y < platform.y - 20 && 
          Math.abs(this.player.x - platform.x) < 100) {
        data.passed = true;
        this.platformsPassed++;
      }
    });

    // 检测游戏结束（掉落）
    if (this.player.y > this.deathZone) {
      this.gameOver();
    }

    // 检测胜利（通过所有平台）
    if (this.platformsPassed >= 10 && !this.isGameOver) {
      this.victory();
    }

    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isGameOver ? 'GAME OVER' : 'PLAYING';
    this.statusText.setText(
      `Status: ${status}\n` +
      `Platforms Passed: ${this.platformsPassed}/10\n` +
      `Survival Time: ${this.survivalTime.toFixed(1)}s\n` +
      `Player Y: ${Math.floor(this.player.y)}\n` +
      `Controls: Arrow Keys + SPACE to Jump`
    );
  }

  gameOver() {
    this.isGameOver = true;
    this.player.setTint(0xff0000);
    this.physics.pause();
    
    this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(400, 360, `Platforms: ${this.platformsPassed}/10`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  victory() {
    this.isGameOver = true;
    this.player.setTint(0xffff00);
    
    this.add.text(400, 300, 'VICTORY!', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(400, 360, `Time: ${this.survivalTime.toFixed(1)}s`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
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
  scene: PlatformGameScene
};

new Phaser.Game(config);