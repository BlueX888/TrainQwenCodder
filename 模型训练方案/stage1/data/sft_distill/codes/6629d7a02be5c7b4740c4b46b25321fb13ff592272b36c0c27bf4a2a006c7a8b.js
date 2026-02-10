class PlatformGame extends Phaser.Scene {
  constructor() {
    super('PlatformGame');
    this.score = 0;
    this.platformsPassed = 0;
    this.gameOver = false;
    this.totalPlatforms = 15;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();
  }

  create() {
    // 添加背景色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建玩家
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(false);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      immovable: true,
      allowGravity: false
    });

    // 生成15个移动平台，形成路径
    this.platformData = [];
    const startX = 100;
    const startY = 200;
    
    for (let i = 0; i < this.totalPlatforms; i++) {
      // 计算平台位置（之字形路径）
      const x = startX + (i % 3) * 200 + Math.floor(i / 3) * 100;
      const y = startY + Math.floor(i / 3) * 80;
      
      const platform = this.platforms.create(x, y, 'platform');
      platform.setImmovable(true);
      platform.body.allowGravity = false;
      
      // 设置平台移动数据
      const moveDirection = i % 2 === 0 ? 1 : -1;
      const moveRange = 100;
      
      this.platformData.push({
        sprite: platform,
        startX: x,
        direction: moveDirection,
        range: moveRange,
        speed: 80,
        passed: false,
        index: i
      });
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms, this.onPlatformCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 分数文本
    this.scoreText = this.add.text(16, 16, 'Platforms: 0/' + this.totalPlatforms, {
      fontSize: '24px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.scoreText.setScrollFactor(0);

    // 状态文本
    this.statusText = this.add.text(16, 50, 'Press SPACE to jump', {
      fontSize: '18px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);

    // 游戏状态变量（可验证）
    this.gameState = {
      score: 0,
      platformsPassed: 0,
      playerAlive: true,
      totalPlatforms: this.totalPlatforms,
      currentPlatform: 0
    };

    // 设置相机跟随
    this.cameras.main.setBounds(0, 0, 2000, 1200);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  onPlatformCollision(player, platform) {
    // 检查是否是新通过的平台
    const platformInfo = this.platformData.find(p => p.sprite === platform);
    if (platformInfo && !platformInfo.passed) {
      platformInfo.passed = true;
      this.platformsPassed++;
      this.score += 100;
      this.gameState.platformsPassed = this.platformsPassed;
      this.gameState.score = this.score;
      this.gameState.currentPlatform = platformInfo.index;
      
      this.scoreText.setText('Platforms: ' + this.platformsPassed + '/' + this.totalPlatforms);
      
      // 检查是否通过所有平台
      if (this.platformsPassed >= this.totalPlatforms) {
        this.winGame();
      }
    }
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 检查玩家是否掉落
    if (this.player.y > 1000) {
      this.loseGame();
      return;
    }

    // 玩家左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只能在平台上跳）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新平台移动
    this.platformData.forEach(data => {
      const platform = data.sprite;
      
      // 水平移动平台
      const currentX = platform.x;
      const distance = Math.abs(currentX - data.startX);
      
      if (distance >= data.range) {
        data.direction *= -1;
      }
      
      platform.x += data.direction * data.speed * (delta / 1000);
      platform.body.x = platform.x - platform.width / 2;
    });

    // 更新状态信息
    this.statusText.setText(
      'Position: (' + Math.floor(this.player.x) + ', ' + Math.floor(this.player.y) + ')'
    );
  }

  winGame() {
    this.gameOver = true;
    this.gameState.playerAlive = true;
    
    const winText = this.add.text(
      this.cameras.main.scrollX + 400,
      this.cameras.main.scrollY + 250,
      'YOU WIN!\nScore: ' + this.score,
      {
        fontSize: '48px',
        fill: '#00ff00',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    winText.setOrigin(0.5);
    winText.setScrollFactor(0);
    
    this.player.setVelocity(0, 0);
    this.physics.pause();
  }

  loseGame() {
    this.gameOver = true;
    this.gameState.playerAlive = false;
    
    const loseText = this.add.text(
      this.cameras.main.scrollX + 400,
      this.cameras.main.scrollY + 250,
      'GAME OVER!\nPlatforms Passed: ' + this.platformsPassed + '/' + this.totalPlatforms,
      {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    loseText.setOrigin(0.5);
    loseText.setScrollFactor(0);
    
    this.physics.pause();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PlatformGame
};

const game = new Phaser.Game(config);