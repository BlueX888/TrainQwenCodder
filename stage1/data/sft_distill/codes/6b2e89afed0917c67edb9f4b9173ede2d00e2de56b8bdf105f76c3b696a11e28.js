// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.gameStarted = false; // 状态验证变量
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, width, height);
    
    // 创建按钮背景（白色矩形）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2 - buttonWidth / 2;
    const buttonY = height / 2 - buttonHeight / 2;
    
    const button = this.add.graphics();
    button.fillStyle(0xffffff, 1);
    button.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // 添加按钮文字（使用Graphics绘制简单文本效果）
    const text = this.add.text(
      width / 2,
      height / 2,
      '开始游戏',
      {
        fontSize: '24px',
        color: '#000000',
        fontFamily: 'Arial'
      }
    );
    text.setOrigin(0.5, 0.5);
    
    // 添加标题
    const title = this.add.text(
      width / 2,
      height / 3,
      'Phaser3 双场景示例',
      {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    title.setOrigin(0.5, 0.5);
    
    // 设置按钮交互区域
    const buttonZone = this.add.zone(
      width / 2,
      height / 2,
      buttonWidth,
      buttonHeight
    );
    buttonZone.setInteractive({ useHandCursor: true });
    
    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      button.clear();
      button.fillStyle(0xdddddd, 1);
      button.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    });
    
    buttonZone.on('pointerout', () => {
      button.clear();
      button.fillStyle(0xffffff, 1);
      button.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    });
    
    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      this.gameStarted = true;
      console.log('MenuScene: 游戏已启动，切换到GameScene');
      
      // 按钮按下视觉反馈
      button.clear();
      button.fillStyle(0xaaaaaa, 1);
      button.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
      
      // 延迟切换场景，提供视觉反馈
      this.time.delayedCall(150, () => {
        this.scene.start('GameScene');
      });
    });
    
    // 添加提示文字
    const hint = this.add.text(
      width / 2,
      height * 0.75,
      '点击按钮开始游戏',
      {
        fontSize: '16px',
        color: '#888888',
        fontFamily: 'Arial'
      }
    );
    hint.setOrigin(0.5, 0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;        // 状态验证变量：分数
    this.level = 1;        // 状态验证变量：关卡
    this.health = 100;     // 状态验证变量：生命值
    this.gameActive = true; // 状态验证变量：游戏激活状态
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, width, height);
    
    // 显示游戏标题
    const title = this.add.text(
      width / 2,
      80,
      '游戏场景',
      {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
      }
    );
    title.setOrigin(0.5, 0.5);
    
    // 显示状态信息
    this.scoreText = this.add.text(
      50,
      150,
      `分数: ${this.score}`,
      {
        fontSize: '20px',
        color: '#00ff00',
        fontFamily: 'Arial'
      }
    );
    
    this.levelText = this.add.text(
      50,
      190,
      `关卡: ${this.level}`,
      {
        fontSize: '20px',
        color: '#00ffff',
        fontFamily: 'Arial'
      }
    );
    
    this.healthText = this.add.text(
      50,
      230,
      `生命值: ${this.health}`,
      {
        fontSize: '20px',
        color: '#ff6b6b',
        fontFamily: 'Arial'
      }
    );
    
    // 创建一个简单的玩家对象（使用Graphics）
    const player = this.add.graphics();
    player.fillStyle(0x00ff00, 1);
    player.fillCircle(width / 2, height / 2, 20);
    
    // 添加玩家标签
    const playerLabel = this.add.text(
      width / 2,
      height / 2 + 40,
      '玩家',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    playerLabel.setOrigin(0.5, 0.5);
    
    // 创建返回按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width / 2 - backButtonWidth / 2;
    const backButtonY = height - 100;
    
    const backButton = this.add.graphics();
    backButton.fillStyle(0x444444, 1);
    backButton.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    
    const backText = this.add.text(
      width / 2,
      height - 75,
      '返回菜单',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    backText.setOrigin(0.5, 0.5);
    
    // 返回按钮交互
    const backZone = this.add.zone(
      width / 2,
      height - 75,
      backButtonWidth,
      backButtonHeight
    );
    backZone.setInteractive({ useHandCursor: true });
    
    backZone.on('pointerover', () => {
      backButton.clear();
      backButton.fillStyle(0x666666, 1);
      backButton.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    });
    
    backZone.on('pointerout', () => {
      backButton.clear();
      backButton.fillStyle(0x444444, 1);
      backButton.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
    });
    
    backZone.on('pointerdown', () => {
      console.log('GameScene: 返回菜单');
      this.scene.start('MenuScene');
    });
    
    // 添加游戏说明
    const instruction = this.add.text(
      width / 2,
      height / 2 + 100,
      '游戏场景已加载\n点击下方按钮返回菜单',
      {
        fontSize: '18px',
        color: '#aaaaaa',
        fontFamily: 'Arial',
        align: 'center'
      }
    );
    instruction.setOrigin(0.5, 0.5);
    
    // 模拟游戏逻辑：定时增加分数
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameActive) {
          this.score += 10;
          this.scoreText.setText(`分数: ${this.score}`);
          
          // 每100分升级
          if (this.score % 100 === 0 && this.score > 0) {
            this.level++;
            this.levelText.setText(`关卡: ${this.level}`);
          }
        }
      },
      loop: true
    });
    
    console.log('GameScene: 场景创建完成，游戏状态已初始化');
  }

  update(time, delta) {
    // 游戏更新逻辑（如果需要）
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  parent: 'game-container',
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene为默认启动场景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 添加全局状态验证
console.log('Phaser3 双场景游戏已启动');
console.log('场景列表:', config.scene.map(s => s.name || 'Scene'));