class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.spaceKey = null;
    this.canShoot = true;
    this.levelText = null;
    this.enemyCountText = null;
    this.statusText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();
    
    // 初始化关卡
    this.startLevel();
    
    // 创建玩家
    this.createPlayer();
    
    // 创建子弹组
    this.bullets = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Sprite,
      maxSize: 20,
      runChildUpdate: true
    });
    
    // 创建UI
    this.createUI();
    
    // 设置输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 设置碰撞
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
    
    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();
    
    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  createPlayer() {
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);
  }

  startLevel() {
    // 计算当前关卡敌人数量：5 + 2 * (level - 1)
    this.enemiesPerLevel = 5 + 2 * (this.currentLevel - 1);
    
    // 清除旧敌人
    if (this.enemies) {
      this.enemies.clear(true, true);
    }
    
    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成敌人
    this.spawnEnemies();
    
    // 更新UI
    this.updateUI();
    
    // 显示关卡开始提示
    if (this.statusText) {
      this.statusText.setText(`Level ${this.currentLevel} Start!`);
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
      });
    }
  }

  spawnEnemies() {
    const rows = Math.ceil(Math.sqrt(this.enemiesPerLevel));
    const cols = Math.ceil(this.enemiesPerLevel / rows);
    const spacing = 80;
    const startX = 400 - (cols - 1) * spacing / 2;
    const startY = 100;
    
    let count = 0;
    for (let row = 0; row < rows && count < this.enemiesPerLevel; row++) {
      for (let col = 0; col < cols && count < this.enemiesPerLevel; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(20, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        count++;
      }
    }
  }

  createUI() {
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    this.updateUI();
  }

  updateUI() {
    if (this.levelText) {
      this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    }
    if (this.enemyCountText) {
      const remaining = this.enemies ? this.enemies.countActive(true) : 0;
      this.enemyCountText.setText(`Enemies: ${remaining}/${this.enemiesPerLevel}`);
    }
  }

  update(time, delta) {
    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }
    
    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shoot();
    }
    
    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
    
    // 检查是否清空所有敌人
    if (this.enemies.countActive(true) === 0 && this.enemiesPerLevel > 0) {
      this.nextLevel();
    }
    
    // 更新敌人计数
    this.updateUI();
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20, 'bullet');
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setSize(8, 8);
      bullet.setVelocityY(-400);
      
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
  }

  nextLevel() {
    this.currentLevel++;
    
    if (this.currentLevel > this.maxLevel) {
      // 游戏胜利
      this.statusText.setText('YOU WIN! All Levels Complete!');
      this.statusText.setStyle({ fontSize: '40px', color: '#00ff00' });
      this.physics.pause();
      this.input.keyboard.enabled = false;
    } else {
      // 进入下一关
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);