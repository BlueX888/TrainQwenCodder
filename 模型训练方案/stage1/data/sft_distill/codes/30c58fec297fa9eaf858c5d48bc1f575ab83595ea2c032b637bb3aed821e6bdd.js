class PlatformJumpScene extends Phaser.Scene {
  constructor() {
    super('PlatformJumpScene');
    this.platformsPassed = 0;
    this.gameWon = false;
    this.platformSpeed = 120;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 60, 60);
    goalGraphics.generateTexture('goal', 60, 60);
    goalGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建 8 个移动平台，形成路径
    const platformConfigs = [
      { x: 100, y: 550, moveType: 'none' }, // 起始平台（静止）
      { x: 250, y: 480, moveType: 'horizontal', min: 200, max: 350 },
      { x: 400, y: 420, moveType: 'vertical', min: 370, max: 470 },
      { x: 520, y: 360, moveType: 'horizontal', min: 480, max: 600 },
      { x: 650, y: 300, moveType: 'vertical', min: 250, max: 350 },
      { x: 750, y: 240, moveType: 'horizontal', min: 700, max: 800 },
      { x: 850, y: 180, moveType: 'vertical', min: 130, max: 230 },
      { x: 950, y: 120, moveType: 'none' } // 最终平台（静止）
    ];

    this.platformObjects = [];
    platformConfigs.forEach((config, index) => {
      const platform = this.platforms.create(config.x, config.y, 'platform');
      platform.body.setImmovable(true);
      platform.body.setAllowGravity(false);
      
      // 存储平台配置
      platform.moveType = config.moveType;
      platform.initialX = config.x;
      platform.initialY = config.y;
      platform.minRange = config.min;
      platform.maxRange = config.max;
      platform.direction = 1; // 1 或 -1
      platform.platformIndex = index;

      this.platformObjects.push(platform);
    });

    // 创建终点目标
    this.goal = this.physics.add.sprite(980, 80, 'goal');
    this.goal.body.setAllowGravity(false);
    this.goal.body.setImmovable(true);

    // 碰撞检测
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 570, 'Controls: Arrow Keys to Move, SPACE to Jump', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    // 添加背景色
    this.cameras.main.setBackgroundColor('#222244');
  }

  update(time, delta) {
    if (this.gameWon) {
      return;
    }

    // 玩家水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面或平台上）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }

    // 更新移动平台
    this.platformObjects.forEach(platform => {
      if (platform.moveType === 'horizontal') {
        // 水平移动
        platform.x += this.platformSpeed * platform.direction * (delta / 1000);
        
        if (platform.x >= platform.maxRange) {
          platform.x = platform.maxRange;
          platform.direction = -1;
        } else if (platform.x <= platform.minRange) {
          platform.x = platform.minRange;
          platform.direction = 1;
        }
      } else if (platform.moveType === 'vertical') {
        // 垂直移动
        platform.y += this.platformSpeed * platform.direction * (delta / 1000);
        
        if (platform.y >= platform.maxRange) {
          platform.y = platform.maxRange;
          platform.direction = -1;
        } else if (platform.y <= platform.minRange) {
          platform.y = platform.minRange;
          platform.direction = 1;
        }
      }
    });

    // 检查玩家是否掉落
    if (this.player.y > 650) {
      this.resetPlayer();
    }

    // 计算通过的平台数量（基于玩家的 x 位置）
    const currentProgress = Math.floor(this.player.x / 120);
    this.platformsPassed = Math.min(currentProgress, 8);

    // 更新状态显示
    this.statusText.setText(
      `Platforms Passed: ${this.platformsPassed}/8\n` +
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    );
  }

  resetPlayer() {
    this.player.setPosition(100, 500);
    this.player.setVelocity(0, 0);
    this.platformsPassed = 0;
  }

  reachGoal(player, goal) {
    if (!this.gameWon) {
      this.gameWon = true;
      this.platformsPassed = 8;
      player.setVelocity(0, 0);
      
      this.add.text(400, 300, 'YOU WIN!', {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      this.statusText.setText(
        `Platforms Passed: ${this.platformsPassed}/8\n` +
        `VICTORY!`
      );
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: PlatformJumpScene,
  backgroundColor: '#222244'
};

const game = new Phaser.Game(config);