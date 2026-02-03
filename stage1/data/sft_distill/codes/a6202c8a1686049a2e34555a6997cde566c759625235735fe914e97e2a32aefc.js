class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 5;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 5, 10);
    bulletGraphics.generateTexture('bullet', 5, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameCompleted = true;
      this.statusText.setText('恭喜通关！\n完成所有5关');
      this.physics.pause();
      return;
    }

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 生成敌人
    const rows = Math.ceil(enemyCount / 5);
    const cols = Math.min(enemyCount, 5);
    const startX = 150;
    const startY = 80;
    const spacingX = 100;
    const spacingY = 80;

    let created = 0;
    for (let row = 0; row < rows && created < enemyCount; row++) {
      for (let col = 0; col < cols && created < enemyCount; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(50 + this.currentLevel * 10, 0);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        created++;
      }
    }

    // 更新UI
    this.updateUI();
    
    // 显示关卡开始提示
    this.statusText.setText(`第 ${this.currentLevel} 关开始！`);
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动
    const speed = 300;
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + 200) {
      this.shoot();
      this.lastFired = time;
    }

    // 更新子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0 && !this.gameCompleted) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  shoot() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 30);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();
    
    this.remainingEnemies--;
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`剩余敌人: ${this.remainingEnemies}`);
  }
}

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
  scene: GameScene
};

const game = new Phaser.Game(config);